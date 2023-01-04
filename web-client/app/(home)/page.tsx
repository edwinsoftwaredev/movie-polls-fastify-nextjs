import { headers } from 'next/headers';
import trpc from 'src/trpc/server';
import Home from './home';

export default async function Page() {
  const { isAuthenticated } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );

  /* @ts-expect-error Server Component */
  return <Home />;
}
