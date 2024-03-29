import type { AppRouter } from 'trpc/client';
import { getRoute } from './routeHelper';
import { createTRPCProxyClient, httpLink } from '@trpc/client';
import { cache } from 'react';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

// NOTE: The expected headers are the headers
// in the nextjs request object.
export const createTRPCClient = (headers: ReadonlyHeaders | undefined) =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `${process.env.API_HOST_URL}/trpc`,
        fetch: (input, init) => {
          const cookies = headers?.get('Cookie');
          const bUrl = getRoute(input.toString());

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
      headers?: ReadonlyHeaders | undefined
    ): Promise<inferRouterOutputs<AppRouter[RouterKey]>[ProcKey]> => {
      const trpcClient = createTRPCClient(headers);
      return (trpcClient as any)[routerKey][procKey].query(procInput);
    }
  ),
};

export default trpc;
