import { httpLink } from '@trpc/client/links/httpLink';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import { splitLink } from '@trpc/client/links/splitLink';
import { TRPCLink } from '@trpc/react';
import { AppRouter } from 'trpc/client';

interface MappedRouterRoutesType {
  prefix: string;
  url: string;
}

// TODO: Install server-only package
const isWebView = typeof window !== 'undefined';

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
  {
    prefix: 'movies:',
    url: `${apiURL}/trpc/moviesRoutes`
  }
];

const routerLinks = [
  ...mappedRouters.map((router) =>
    splitLink({
      condition(op) {
        return op.path.startsWith(router.prefix);
      },
      // TODO: Validate trpc batching -> fetch/cache API 
      true: isWebView ? 
        httpBatchLink<AppRouter>({ url: router.url }) : 
        httpLink<AppRouter>({ url: router.url }),
      false: nextLink,
    })
  ),
  httpLink({
    url: `${apiURL}/trpc`,
  })
];

export default routerLinks;
