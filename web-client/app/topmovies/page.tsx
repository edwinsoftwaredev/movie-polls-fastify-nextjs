import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTRPCClient } from 'src/trpc/server';
import TopMovies from './TopMovies';

export default async function Page() {
  const reqHeaders = headers();
  const { session } = getTRPCClient(reqHeaders, 'sessionRoutes');
  const { isAuthenticated } = await session.getSession.query();

  // if (!isAuthenticated) {
  //   redirect('/');
  // }

  return (
    <>
      <section>
        <article>
          <h2>{`${2020}'s Popular Movies`}</h2>
        </article>

        {/** slider*/}
        <section>
          {/* @ts-expect-error Server Component */}
          <TopMovies />
        </section>
      </section>
    </>
  );
}
