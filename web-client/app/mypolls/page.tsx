import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import trpc from 'src/trpc/server';
import MyPolls from './MyPolls';

export async function generateMetadata({}): Promise<Metadata> {
  const { csrfToken } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );
  return { title: 'My Polls', other: { 'csrf-token': csrfToken } };
}

export default async function Page() {
  const { isAuthenticated } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );

  if (!isAuthenticated) redirect('/');

  const { polls: inactivePolls } = await trpc.query(
    'poll',
    'inactivePolls',
    undefined,
    headers()
  );

  const { polls: activePolls } = await trpc.query(
    'poll',
    'activePolls',
    undefined,
    headers()
  );

  return <MyPolls activePolls={activePolls} inactivePolls={inactivePolls} />;
}
