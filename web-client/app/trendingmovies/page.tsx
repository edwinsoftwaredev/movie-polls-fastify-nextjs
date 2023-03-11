import TrendingMovies from './TrendingMovies';
import { AppTabs } from 'src/components/responsive-components';
import styles from './TrendingMovies.module.scss';
import { headers } from 'next/headers';

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
