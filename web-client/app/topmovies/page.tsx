import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppTabs } from 'src/components/responsive-components';
import DSelect from 'src/components/top-movies/DSelect';
import trpc from 'src/trpc/server';
import TopMovies from './TopMovies';

const d: Record<string, number> = {
  2020: 2020,
  2010: 2010,
  2000: 2000,
  1990: 1990,
  1980: 1980,
  1970: 1970,
};

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
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
      <AppTabs currentPath="/topmovies" />
      <section>
        <article>
          <DSelect d={d[searchParams['d'] ?? 2020]} />
        </article>

        {/** slider*/}
        <section>
          {/* @ts-expect-error Server Component */}
          <TopMovies d={d[searchParams['d']]} />
        </section>
      </section>
    </>
  );
}
