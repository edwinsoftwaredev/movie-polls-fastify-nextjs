import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
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
          {/* @ts-expect-error Server Component */}
          <TrendingMovies />
        </section>
      </section>
    </>
  );
}