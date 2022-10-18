import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import { TRPCLink } from '@trpc/client';
import { httpLink } from '@trpc/client/links/httpLink';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import { splitLink } from '@trpc/client/links/splitLink';
import { withTRPC } from '@trpc/next';
import { AppRouter } from 'trpc/client';
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode & ReactElement 
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  return getLayout(<Component {...pageProps} />);
}

interface MappedRouterRoutesType {
  prefix: string;
  url: string;
}

const isClient = typeof window !== 'undefined';

// api url
const apiURL = isClient
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

export default withTRPC<AppRouter>({
  ssr: true,
  config: ({ ctx }) => {
    // During client requests
    if (isClient) {
      const csrfToken = document
        .querySelector("meta[name='csrf-token']")
        ?.getAttribute('content');

      return {
        url: `${apiURL}/trpc`,
        links: routerLinks,
        // When app initialize (not client) ctx?.req is not defined as expected
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
              ...options?.headers,
              ...(csrfToken ? { 'csrf-token': csrfToken } : {}),
            },
          });
        },
      };
    }

    // optional: use SSG-caching for each rendered page (see caching section for more details)
    const ONE_DAY_SECONDS = 60 * 60 * 24;
    ctx?.res?.setHeader(
      'Cache-Control',
      `s-maxage=1, stale-while-revalidate=${ONE_DAY_SECONDS}`
    );

    // During SSR
    return {
      url: `${apiURL}/trpc`,
      links: routerLinks,
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
        });
      },
      headers: () => {
        if (!ctx?.req) return {};
        const { headers } = ctx.req;
        return {
          // --- IMPORTANT ---
          // headers added here are going to be
          // forwarded to the API server
          ...headers,
          Origin: process.env.HOST_URL,
          'x-ssr': '1',
        };
      },
    };
  },
})(MyApp);
