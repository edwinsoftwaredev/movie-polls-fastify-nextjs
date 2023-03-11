import { headers } from 'next/headers';
import trpc from 'src/trpc/server';
import CurrentPolls from './CurrentPolls';

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
