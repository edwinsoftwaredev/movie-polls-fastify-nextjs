import style from './account.module.scss';
import trpcClient from 'src/trpc/server';
import { headers } from 'next/headers';

export default async function Page() {
  const reqHeaders = headers();
  const trpc = trpcClient(reqHeaders);
  const session = trpc.query('session:getSession');
  const whoami = trpc.query('account:whoami');

  return (
    <div className={style['main']}>
      <span>Account</span>
    </div>
  );
}
