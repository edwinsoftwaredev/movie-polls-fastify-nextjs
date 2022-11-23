import style from './account.module.scss';
import trpc from 'src/trpc/server';

export default async function Page() {
  const session = trpc.query('session:getSession');
  const whoami = trpc.query('account:whoami');

  return (
    <div className={style['main']}>
      <span>Account</span>
    </div>
  );
}
