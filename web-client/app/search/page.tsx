import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Search from 'src/components/search/Search';
import trpc from 'src/trpc/server';
import style from './Search.module.scss';

export async function generateMetadata({}): Promise<Metadata> {
  const { csrfToken } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );
  return { title: 'Search', other: { 'csrf-token': csrfToken } };
}

export default async function Page() {
  const { isAuthenticated } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );

  if (!isAuthenticated) {
    redirect('/');
  }

  return (
    <div className={style['search-page']}>
      <Search />
    </div>
  );
}
