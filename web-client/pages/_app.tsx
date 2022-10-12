import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { withTRPC } from '@trpc/next';
import { httpLink } from '@trpc/client/links/httpLink';
import { splitLink } from '@trpc/client/links/splitLink';
import { AccountRouter, GoogleAuthRouter, SessionRouter } from 'trpc/client';
import { TRPCLink } from '@trpc/client';

const nextLink: TRPCLink<any> = (runtime) => {
  return ({ prev, next, op }) => {
    // It calls for the next link but
    // with the previous "context"
    next(op, (result) => {
      prev(result);
    });
  };
};

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default withTRPC({
  ssr: true,
  config: ({ ctx }) => {
    const isClient = typeof window !== 'undefined';

    // api url
    const apiUrl = isClient
      ? process.env.NEXT_PUBLIC_API_HOST_URL
      : process.env.API_HOST_URL;

    const links = [
      splitLink({
        condition(op) {
          // Link determined by path
          return op.path.includes('session:');
        },
        true: httpLink<SessionRouter>({
          url: `${apiUrl}/trpc/sessionRoutes`,
        }),
        false: nextLink,
      }),
      splitLink({
        condition(op) {
          // Link determined by path
          return op.path.includes('account:');
        },
        true: httpLink<AccountRouter>({
          url: `${apiUrl}/trpc/accountRoutes`,
        }),
        false: nextLink,
      }),
      splitLink({
        condition(op) {
          // Link determined by path
          return op.path.includes('account:');
        },
        true: httpLink<GoogleAuthRouter>({
          url: `${apiUrl}/trpc/googleAuthRoutes`,
        }),
        false: nextLink,
      }),
      httpLink({
        url: `${apiUrl}/trpc`,
      }),
    ];

    // During client requests
    if (isClient) {
      const csrfToken = document
        .querySelector("meta[name='csrf-token']")
        ?.getAttribute('content');

      return {
        url: `${apiUrl}/trpc`,
        links,
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
      url: `${apiUrl}/trpc`,
      links,
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
