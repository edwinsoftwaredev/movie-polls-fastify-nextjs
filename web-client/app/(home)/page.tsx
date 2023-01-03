import { headers } from 'next/headers';
import { getTRPCClient } from 'src/trpc/server';
import Home from './home';

export default async function Page() {
  const { session } = getTRPCClient(headers(), 'sessionRoutes');
  const { isAuthenticated } = await session.getSession.query();

  /* @ts-expect-error Server Component */
  return <Home />;
}
