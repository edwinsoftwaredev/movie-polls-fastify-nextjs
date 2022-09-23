import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { withTRPC } from '@trpc/next';
import { AppRouter } from 'trpc/server';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default withTRPC<AppRouter>({
  ssr: true,
  config: ({ ctx }) => {
    // During client requests
    if (typeof window !== 'undefined') {
      return {
        url: `${process.env.NEXT_PUBLIC_API_HOST_URL}/trpc`,
        // When app initialize (not client) ctx?.req is not defined as expected
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            credentials: 'include',
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
      url: `${process.env.API_HOST_URL}/trpc`,
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
