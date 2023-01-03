import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTRPCClient } from 'src/trpc/server';
import TrendingMovies from './TrendingMovies';

export default async function Page() {
  const { session } = getTRPCClient(headers(), 'sessionRoutes');
  const { isAuthenticated } = await session.getSession.query();

  // if (!isAuthenticated) {
  //   redirect('/');
  // }

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
