import { TRPCClientError } from '@trpc/client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import trpc from 'src/trpc/server';
import Vote from './Vote';

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { vt: string };
}) {
  const { id } = params;
  const { vt } = searchParams;

  const { votingToken } = await trpc
    .query('publicPoll', 'votingToken', { id: vt, pollId: id }, headers())
    .catch((err) => {
      if (err instanceof TRPCClientError) {
        if (err.data.code === 'NOT_FOUND') {
          redirect('/');
        }
      }

      throw err;
    });

  if (!votingToken) redirect('/');

  const { poll } = await trpc
    .query('publicPoll', 'poll', { pollId: id }, headers())
    .catch((err) => {
      if (err instanceof TRPCClientError) {
        if (err.data.code === 'UNAUTHORIZED') {
          redirect('/');
        }
      }

      throw err;
    });

  return <Vote poll={poll} />;
}
