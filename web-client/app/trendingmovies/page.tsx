import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { trpc } from 'src/trpc/server';
import TrendingMovies from './TrendingMovies';

export default async function Page() {
  const reqHeaders = headers();
  const session = await trpc.query('session:getSession', reqHeaders);
  const { isAuthenticated } = session;

  if (!isAuthenticated) {
    redirect('/');
  }

  return (
    <>
      <section>
        <article>
          <h2>Trending Movies</h2>
        </article>

        {/** slider*/}
        <section>
          <Suspense fallback={<p>Loading...</p>}>
            {/* @ts-expect-error Server Component */}
            <TrendingMovies />
          </Suspense>
        </section>
      </section>
    </>
  );
}
