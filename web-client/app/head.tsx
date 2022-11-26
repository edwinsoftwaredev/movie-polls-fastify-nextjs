import { headers } from 'next/headers';
import { trpc } from 'src/trpc/server';

export default async function Head() {
  const reqHeaders = headers();
  const { csrfToken } = await trpc.query('session:getSession', reqHeaders);

  return (
    <>
      <title>Movie Polls</title>
      <meta
        name="description"
        content="Create movie polls and let everyone decide the winner."
      />
      <meta name="csrf-token" content={csrfToken} />
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}
