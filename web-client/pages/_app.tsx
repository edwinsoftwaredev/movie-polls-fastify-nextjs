import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { ReactElement, ReactNode, useState } from 'react';
import { trpc, trpcClient } from 'src/trpc';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode & ReactElement 
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp(props: AppPropsWithLayout) {
  const { Component, pageProps } = props;
  const [queryClient] = useState(() => new QueryClient());
  const [tRPCClient] = useState(() => trpcClient); 

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <trpc.Provider client={tRPCClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={(pageProps as any).dehydratedState}>
          {getLayout(<Component {...pageProps} />)}
        </Hydrate>
      </QueryClientProvider>
    </trpc.Provider>
  )
}

