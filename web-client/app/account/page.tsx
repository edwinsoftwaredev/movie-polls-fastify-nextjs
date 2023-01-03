import style from './Account.module.scss';
import { headers } from 'next/headers';
import { getTRPCClient } from 'src/trpc/server';

export default async function Page() {
  const { session } = getTRPCClient(headers(), 'sessionRoutes');

  return (
    <div className={style['main']}>
      <span>Account</span>
    </div>
  );
}
