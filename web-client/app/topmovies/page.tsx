import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import trpc from 'src/trpc/server';
import TopMovies from './TopMovies';

export default async function Page() {
  const { isAuthenticated } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );

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
