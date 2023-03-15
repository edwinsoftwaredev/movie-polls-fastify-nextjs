import type { Metadata } from 'next';
import { headers } from 'next/headers';
import trpc from 'src/trpc/server';
import CurrentPolls from './CurrentPolls';

export async function generateMetadata({}): Promise<Metadata> {
  const { csrfToken } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );
  return {
    description: 'Movie polls made easy',
    other: { 'csrf-token': csrfToken },
  };
}

async function ActivePolls() {
  const { polls: activePolls } = await trpc.query(
    'poll',
    'activePolls',
    undefined,
    headers()
  );

  return <CurrentPolls activePolls={activePolls} />;
}

export default async function Page() {
  const { isAuthenticated } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );

  return (
    <>
      {isAuthenticated ? (
        <section className="slider-container">
          {/* @ts-expect-error Server Component */}
          <ActivePolls />
        </section>
      ) : null}
    </>
  );
}
