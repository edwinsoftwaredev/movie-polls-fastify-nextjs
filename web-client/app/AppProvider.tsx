'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpLink } from '@trpc/client';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import trpc from 'src/trpc/client';
import { getRoute } from 'src/trpc/routeHelper';

const SessionHandler: React.FC = () => {
  const { data: sessionData } = trpc.session.getSession.useQuery(undefined, {
    // TODO: update
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    sessionData &&
      document
        .getElementsByName('csrf-token')
        .item(0)
        .setAttribute('content', sessionData.csrfToken);
  }, [sessionData?.csrfToken]);

  return null;
};

interface AppContextType {
  documentBodySize: number;
}

export const AppContext = createContext<AppContextType>({
  documentBodySize: 0,
});

interface AppProviderProps extends PropsWithChildren {}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const apiURL = process.env.NEXT_PUBLIC_API_HOST_URL;

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        // TODO: Add TRPC links for each route prefix defined
        // in the api. This will allow TRPC batching
        httpLink({
          url: `${apiURL}/trpc`,
          fetch: (input, init) => {
            const csrftoken = document
              .querySelector("meta[name='csrf-token']")
              ?.getAttribute('content');

            const bUrl = getRoute(input.toString());

            return fetch(bUrl, {
              ...init,
              credentials: 'include',
              headers: {
                ...init?.headers,
                ...(csrftoken ? { 'csrf-token': csrftoken } : {}),
              },
            });
          },
        }),
      ],
    })
  );

  return (
    <AppContext.Provider
      value={{
        documentBodySize: 0,
      }}
    >
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <SessionHandler />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          />
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </AppContext.Provider>
  );
};

export default AppProvider;
