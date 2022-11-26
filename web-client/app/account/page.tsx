import style from './Account.module.scss';
import { headers } from 'next/headers';
import { trpc } from 'src/trpc/server';

export default async function Page() {
  const reqHeaders = headers();
  const session = trpc.query('session:getSession', reqHeaders);
  const whoami = trpc.query('account:whoami', reqHeaders);

  return (
    <div className={style['main']}>
      <span>Account</span>
    </div>
  );
}
