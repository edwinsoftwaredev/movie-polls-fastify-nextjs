import { headers } from 'next/headers';
import trpc from 'src/trpc/server';
import style from './Account.module.scss';

export default async function Page() {
  const { isAuthenticated } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );

  return (
    <div className={style['main']}>
      <span>Account</span>
    </div>
  );
}
