import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AppTabs } from 'src/components/responsive-components';
import DSelect from 'src/components/top-movies/DSelect';
import trpc from 'src/trpc/server';
import TopMovies from './TopMovies';

export async function generateMetadata({}): Promise<Metadata> {
  const { csrfToken } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );
  return { title: 'Popular Movies', other: { 'csrf-token': csrfToken } };
}

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
  headers();
  return (
    <>
      <AppTabs currentPath="/topmovies" />
      <section>
        <DSelect d={d[searchParams['d'] ?? 2020]} />

        {/** slider*/}
        <section>
          {/* @ts-expect-error Server Component */}
          <TopMovies d={d[searchParams['d']]} />
        </section>
      </section>
    </>
  );
}
