import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import trpc from 'src/trpc/server';
import PollMovies from './PollMovies';
import styles from './Poll.module.scss';
import { TRPCClientError } from '@trpc/client';

export default async function PollLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
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
      : whoami.id === poll.authorId
    : false;

  const { poll: publicPoll } = !isOwner
    ? await trpc
        .query('publicPoll', 'poll', { pollId: id }, headers())
        .catch((err) => {
          if (err instanceof TRPCClientError) {
            if (err.data.code === 'UNAUTHORIZED') {
              redirect('/');
            }
          }

          throw err;
        })
    : { poll: null };

  const currentPoll = isOwner ? poll : publicPoll;

  if (!currentPoll) redirect('/');

  const isPollExpired = currentPoll.expiresOn
    ? new Date(currentPoll.expiresOn) < new Date()
    : null;

  return (
    <section className={styles['poll-container']}>
      <article className={styles['poll']}>
        <header className={styles['header']}>{children}</header>
        <PollMovies
          pollId={currentPoll.id}
          movies={currentPoll.MoviePoll}
          isPollOwner={isOwner}
          isActivePoll={currentPoll.isActive ?? false}
          isPollExpired={isPollExpired}
        />
      </article>
    </section>
  );
}
