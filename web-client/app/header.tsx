import styles from './header.module.scss';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Voltaire } from 'next/font/google';
import trpc from 'src/trpc/server';
import { NavigationOverlay } from 'src/components/responsive-components';

const voltaire = Voltaire({
  subsets: ['latin'],
  weight: '400',
});

export default async function Header() {
  const { isAuthenticated } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );

  return (
    <div className={styles['container']}>
      <header className={styles['header']}>
        <Link href={'/'}>
          <h1 className={`app-title ${voltaire.className}`}>Movie Polls</h1>
        </Link>
        <div />
        <NavigationOverlay isAuthenticated={isAuthenticated} />
      </header>
    </div>
  );
}
