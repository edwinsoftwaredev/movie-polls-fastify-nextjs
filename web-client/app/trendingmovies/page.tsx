import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import trpc from 'src/trpc/server';
import TrendingMovies from './TrendingMovies';
import { AppTabs } from 'src/components/responsive-components';
import styles from './TrendingMovies.module.scss';

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
      <AppTabs currentPath="/trendingmovies" />
      <section>
        <article className={`${styles['title']}`}>
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
