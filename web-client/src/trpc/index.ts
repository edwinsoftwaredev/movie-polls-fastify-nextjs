import { createReactQueryHooks, createTRPCClient } from '@trpc/react';
import { AppRouter } from 'trpc/client';
import { httpLink } from '@trpc/client/links/httpLink';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import { splitLink } from '@trpc/client/links/splitLink';
import { TRPCLink } from '@trpc/react';
import { IncomingMessage } from 'http';

interface MappedRouterRoutesType {
  prefix: string;
  url: string;
}

const isWebView = typeof window !== 'undefined';

// api url
const apiURL = isWebView
  ? process.env.NEXT_PUBLIC_API_HOST_URL
  : process.env.API_HOST_URL;

// Next.js withTRPC configs ------
const nextLink: TRPCLink<AppRouter> = (_runtime) => {
  return ({ prev, next, op }) => {
    // It calls for the next link but
    // with the previous "context"
    next(op, (result) => {
      prev(result);
    });
  };
};

// Mapped tRPC Routers -----------
const mappedRouters: Array<MappedRouterRoutesType> = [
  {
    prefix: 'session:',
    url: `${apiURL}/trpc/sessionRoutes`,
  },
  {
    prefix: 'account:',
    url: `${apiURL}/trpc/accountRoutes`,
  },
  {
    prefix: 'googleAuth:',
    url: `${apiURL}/trpc/googleAuthRoutes`,
  },
];

const routerLinks = [
  ...mappedRouters.map((router) =>
    splitLink({
      condition(op) {
        return op.path.startsWith(router.prefix);
      },
      true: httpBatchLink<AppRouter>({
        url: router.url,
      }),
      false: nextLink,
    })
  ),
  httpLink({
    url: `${apiURL}/trpc`,
  })
];
// -------------------------------

export const trpc = createReactQueryHooks<AppRouter>();

// NOTE: This variable only works on client side (web view)  
export const trpcClient = trpc.createClient({
  url: `${apiURL}/trpc`,
  links: routerLinks,
  fetch: async (url, options) => {
    const csrftoken = isWebView ? document
      .querySelector("meta[name='csrf-token']")
      ?.getAttribute('content') : null;

    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options?.headers,
        ...(csrftoken ? { 'csrf-token': csrftoken } : {}),
      },
    });
  },
});

// NOTE: This function only works on server side
export const getTRPCClient = (ctx?: {req?: IncomingMessage}) =>
  createTRPCClient<AppRouter>({
    url: `${apiURL}/trpc`,
    links: routerLinks,
    fetch: async (url, options) => {
      console.log(options?.headers)
      return fetch(url, {
        ...options,
      });
    },
    headers: () => {
      if (!ctx?.req) return {};
      const { headers } = ctx.req;
      return {
        ...headers,
        'host': new URL(`${apiURL}`).host,
        'origin': process.env.HOST_URL,
        'x-ssr': '1'
      }
    }
  });
