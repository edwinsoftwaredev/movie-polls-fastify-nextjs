import { createTRPCProxyClient, httpBatchLink } from '@trpc/react-query';
import { AppRouter } from 'trpc/client';

const apiURL = process.env.NEXT_PUBLIC_API_HOST_URL;

// NOTE: Use this variable only on client side (web view)
const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${apiURL}/trpc`,
      fetch: (input, init) => {
        const csrftoken = document
          .querySelector("meta[name='csrf-token']")
          ?.getAttribute('content');

        return fetch(input, {
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
});

export default trpcClient;
