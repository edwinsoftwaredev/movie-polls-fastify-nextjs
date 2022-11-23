import { AppRouter } from 'trpc/client';
import { createTRPCClient } from '@trpc/client';
import routerLinks from './links';
import { ReadonlyHeaders } from 'next/dist/server/app-render';

// TODO: Install server-only package
const isWebView = typeof window !== 'undefined';

const apiURL = !isWebView ?
  process.env.API_HOST_URL : undefined;

// NOTE: Use this function only works on server side
const trpcServerClient = (headers: ReadonlyHeaders) => createTRPCClient<AppRouter>({
  url: `${apiURL}/trpc`,
  links: routerLinks,
  // TODO: Validate that the correct fetch API is being used
  fetch: fetch,
  headers: () => {
    const cookies = headers.get('Cookie');
    
    return {
      ...(cookies ? {'cookie': cookies} : {}),
      // (when proxying)
      // DO NOT set the host from the request's url.
      // VALIDATE that the host
      // in the request url is a valid host!
      'host': new URL(`${apiURL}`).host,
      'origin': process.env.HOST_URL,
      'x-ssr': '1'
    }
  }
});

export default trpcServerClient;
