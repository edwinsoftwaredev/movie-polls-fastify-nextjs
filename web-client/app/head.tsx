import { headers } from 'next/headers';
import { getTRPCClient } from 'src/trpc/server';

export default async function Head() {
  const { session } = getTRPCClient(headers(), 'sessionRoutes');
  const { csrfToken } = await session.getSession.query();

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
