import { cache } from 'react';
import type { AppRouter } from 'trpc/client';
import {
  createTRPCClient as crtTRPCClient,
  CreateTRPCClientOptions,
  TRPCRequestOptions,
} from '@trpc/client';
import routerLinks from './links';
import { ReadonlyHeaders } from 'next/dist/server/app-render';
import { InferHandlerInput, TQuery } from 'trpc/client/utils';

// TODO: Install server-only package
const isWebView = typeof window !== 'undefined';

const apiURL = !isWebView ? process.env.API_HOST_URL : undefined;

// NOTE: Use this function only works on server side
export const getBaseTRPCClientConfig = (
  headers: ReadonlyHeaders
): CreateTRPCClientOptions<AppRouter> => ({
  url: `${apiURL}/trpc`,
  links: routerLinks,
  headers: () => {
    const cookies = headers.get('Cookie');

    return {
      ...(cookies ? { Cookie: cookies } : {}),
      // (when proxying)
      // DO NOT set the host from the request's url.
      // VALIDATE that the host
      // in the request url is a valid host!
      Host: new URL(`${apiURL}`).host,
      Origin: process.env.HOST_URL,
      'x-ssr': '1',
      'x-api-key-movies': process.env.MOVIES_API_KEY,
    };
  },
});

export const createTRPCClient = crtTRPCClient<AppRouter>;
const getTRPCClient = (headers: ReadonlyHeaders) =>
  createTRPCClient(getBaseTRPCClientConfig(headers));

// TODO: Validate that the fetch function in TRPC Client
// is not creating/updating the React cache.
export const trpc = {
  query: cache(
    async <T extends TQuery>(
      path: T,
      headers: ReadonlyHeaders,
      ...args: [...InferHandlerInput<T>, TRPCRequestOptions?]
    ) => {
      const trpc = getTRPCClient(headers);
      const res = await trpc.query(path, ...args);
      return res;
    }
  ),
};
