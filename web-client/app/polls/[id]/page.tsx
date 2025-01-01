import { TRPCClientError } from '@trpc/client';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import PollForm from 'src/components/poll-form/PollForm';
import PollVotingTokens from 'src/components/poll-voting-tokens/PollVotingTokens';
import trpc from 'src/trpc/server';
import { InferQueryOutput } from 'trpc/client/utils';

export async function generateMetadata({}): Promise<Metadata> {
  const { csrfToken } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );
  return { title: 'Poll', other: { 'csrf-token': csrfToken } };
}

const PollFormWithVotingTokens: React.FC<{
  poll: InferQueryOutput<'poll'>['getPoll']['poll'];
}> = ({ poll }) => {
  return (
    <>
      <PollForm poll={poll} />
      <PollVotingTokens poll={poll} />
    </>
  );
};

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  const { whoami } = await trpc.query(
    'account',
    'whoami',
    undefined,
    headers()
  );

  const { poll } = whoami
    ? await trpc
        .query('poll', 'getPoll', { pollId: id }, headers())
        .catch((err) => {
          if (err instanceof TRPCClientError) {
            if (err.data.code === 'UNAUTHORIZED') {
              return { poll: null };
            }
          }

          throw err;
        })
    : { poll: null };

  const isOwner = whoami
    ? poll === null
      ? false
      : whoami.id === poll.author.id
    : false;

  if (isOwner) return <PollFormWithVotingTokens poll={poll!} />;

  return null;
}
