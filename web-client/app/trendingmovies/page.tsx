import TrendingMovies from './TrendingMovies';
import { AppTabs } from 'src/components/responsive-components';
import styles from './TrendingMovies.module.scss';
import { headers } from 'next/headers';
import trpc from 'src/trpc/server';
import type { Metadata } from 'next';

export async function generateMetadata({}): Promise<Metadata> {
  const { csrfToken } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );
  return { title: 'Trending Movies', other: { 'csrf-token': csrfToken } };
}

export default async function Page() {
  headers();

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
