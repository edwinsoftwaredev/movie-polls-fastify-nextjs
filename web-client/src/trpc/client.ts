import { createReactQueryHooks } from '@trpc/react';
import { AppRouter } from 'trpc/client';
import routerLinks from './links';

const apiURL = process.env.NEXT_PUBLIC_API_HOST_URL;

const trpc = createReactQueryHooks<AppRouter>();

// NOTE: Use this variable only on client side (web view)  
const trpcClient = trpc.createClient({
  url: `${apiURL}/trpc`,
  links: routerLinks,
  fetch: async (url, options) => {
    const csrftoken =  document
      .querySelector("meta[name='csrf-token']")
      ?.getAttribute('content'); 

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

export default trpcClient;
