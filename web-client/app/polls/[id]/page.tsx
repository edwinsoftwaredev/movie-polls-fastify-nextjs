import { headers } from 'next/headers';
import PollForm from 'src/components/poll-form/PollForm';
import PollVotingTokens from 'src/components/poll-voting-tokens/PollVotingTokens';
import trpc from 'src/trpc/server';
import { InferQueryOutput } from 'trpc/client/utils';

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

  const { poll } = await trpc.query(
    'poll',
    'getPoll',
    { pollId: id },
    headers()
  );

  const isOwner = whoami ? whoami.id === poll.authorId : false;

  if (isOwner) return <PollFormWithVotingTokens poll={poll} />;

  return null;
}
