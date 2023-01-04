import type { AppRouter } from 'trpc/client';
import { createTRPCProxyClient, httpLink } from '@trpc/client';
import { cache } from 'react';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

const apiURL = process.env.API_HOST_URL;

const trpcRoutersPaths: { [key: string]: string } = {
  'session.': 'sessionRoutes/session.',
  'account.': 'accountRoutes/account.',
  'googleAuth.': 'googleAuthRoutes/googleAuth.',
  'movies.': 'moviesRoutes/movies.',
  'publicMovies.': 'publicMoviesRoutes/publicMovies.',
};

// NOTE: The expected headers are the headers
// in the nextjs request object.
export const createTRPCClient = (headers: Headers | undefined) =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `${apiURL}/trpc`,
        fetch: (input, init) => {
          const cookies = headers?.get('Cookie');
          const aUrl = new URL(input.toString());
          let bUrl = aUrl
            .toString()
            .replace(
              trpcRoutersPaths[0],
              trpcRoutersPaths[trpcRoutersPaths[0]]
            );

          for (let key in trpcRoutersPaths) {
            bUrl = bUrl.replace(key, trpcRoutersPaths[key]);
          }

          return fetch(bUrl, {
            ...init,
            headers: {
              // TODO: Remove sensitive headers from request to cached/public endpoints
              ...(cookies ? { Cookie: cookies } : {}),

              // (when proxying)
              // DO NOT set the host from the request's url.
              // VALIDATE that the host
              // in the request url is a valid host!
              Host: new URL(`${process.env.API_HOST_URL}`).host,
              Origin: process.env.HOST_URL || '',
              'x-ssr': '1',
              'x-api-key-movies': process.env.MOVIES_API_KEY || '',
            },
          });
        },
      }),
    ],
  });

// NOTE: Use this object on server side (server components)
const trpc = {
  query: cache(
    async <
      RouterKey extends keyof inferRouterInputs<AppRouter>,
      ProcKey extends keyof inferRouterInputs<AppRouter[RouterKey]>,
      ProcInput extends inferRouterInputs<AppRouter[RouterKey]>[ProcKey]
    >(
      routerKey: RouterKey,
      procKey: ProcKey,
      procInput: ProcInput,
      headers: Headers | undefined
    ): Promise<inferRouterOutputs<AppRouter[RouterKey]>[ProcKey]> => {
      const trpcClient = createTRPCClient(headers);
      return (trpcClient as any)[routerKey][procKey].query(procInput);
    }
  ),
};

export default trpc;
