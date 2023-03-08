import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import trpc from 'src/trpc/server';
import PollMovies from './PollMovies';
import styles from './Poll.module.scss';
import { TRPCError } from '@trpc/server';

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

  const { poll } = await trpc
    .query('poll', 'getPoll', { pollId: id }, headers())
    .catch((err: TRPCError) => {
      if (err.code === 'UNAUTHORIZED') {
        return { poll: null };
      }

      throw err;
    });

  if (!poll) return null;

  const isOwner = whoami ? whoami.id === poll.authorId : false;

  if (!poll.isActive && !isOwner) redirect('/');

  const movies = poll.MoviePoll;

  return (
    <section className={styles['poll-container']}>
      <article className={styles['poll']}>
        <header className={styles['header']}>{children}</header>
        <PollMovies
          pollId={poll.id}
          movies={movies}
          isPollOwner={isOwner}
          isActivePoll={poll.isActive ?? false}
        />
      </article>
    </section>
  );
}
