import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Poll from 'src/components/poll/Poll';
import trpc from 'src/trpc/server';

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  const { isAuthenticated } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );

  if (!isAuthenticated) redirect('/');

  const { poll } = await trpc.query(
    'poll',
    'getPoll',
    { pollId: id },
    headers()
  );

  return <Poll poll={poll} />;
}
