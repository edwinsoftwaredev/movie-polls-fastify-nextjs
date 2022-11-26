import { headers } from 'next/headers';
import { trpc } from 'src/trpc/server';
import Home from './home';
import Landing from './landing';

export default async function Page() {
  const session = await trpc.query('session:getSession', headers());

  const { isAuthenticated } = session;

  {/* @ts-expect-error Server Component */}
  return isAuthenticated ? <Home /> : <Landing />;
}
