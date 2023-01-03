import type { AppRouter } from 'trpc/client';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

const apiURL = process.env.API_HOST_URL;

// TODO: Calculate based on the selected tRPC query (making use of a generic types) or
// calculate value in the fetch function based on the given input (url) value
type appPaths =
  | 'sessionRoutes'
  | 'accountRoutes'
  | 'moviesRoutes'
  | 'publicMoviesRoutes'
  | 'googleAuthRoutes';

// NOTE: Use this function on server side
export const getTRPCClient = (headers: Headers, path: appPaths) =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${apiURL}/trpc/${path}`,
        fetch: (input, init) => {
          const cookies = headers.get('Cookie');
          return fetch(input, {
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
