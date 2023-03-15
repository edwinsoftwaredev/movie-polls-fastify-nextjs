'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '../Button';
import styles from './NavigationOverlay.module.scss';

const AnonymousUserNavOptions: React.FC = () => (
  <ul>
    <li>
      <Link href="/">Home</Link>
    </li>
    <li>
      <Link href="/topmovies">Top Movies</Link>
    </li>
    <li>
      <Link href="/trendingmovies">Trending Movies</Link>
    </li>
    <hr />
    <li>
      <Link href="/signin">Sign In</Link>
    </li>
    <li>
      <Link href="/about">About</Link>
    </li>
    <li>
      <Link href="/contact">Contact</Link>
    </li>
  </ul>
);

const NavOptions: React.FC = () => {
  const csrftoken =
    typeof window !== 'undefined'
      ? document
          .querySelector("meta[name='csrf-token']")
          ?.getAttribute('content')
      : 'undefined';

  return (
    <ul>
      <li>
        <Link href="/search">
          <div className={styles['search-vector']}>
            <span className="material-symbols-rounded">search</span>
          </div>
        </Link>
      </li>
      <li>
        <Link href="/">Home</Link>
      </li>
      <li>
        <Link href="/topmovies">Top Movies</Link>
      </li>
      <li>
        <Link href="/trendingmovies">Trending Movies</Link>
      </li>
      <li>
        <Link href="/mypolls">My Polls</Link>
      </li>
      <hr />
      <li>
        <Link href="/account">Account</Link>
      </li>
      <li>
        <form
          method="post"
          action={`${process.env.NEXT_PUBLIC_API_HOST_URL}/trpc/accountRoutes/account.logout`}
        >
          <input type="hidden" name="_csrf" value={csrftoken || ''} />
          <Button type="submit">Sign Out</Button>
        </form>
      </li>
    </ul>
  );
};

interface NavigationOverlayProps {
  isAuthenticated: boolean;
}

const NavigationOverlay: React.FC<NavigationOverlayProps> = ({
  isAuthenticated,
}) => {
  const pathname = usePathname();

  const [currentPathname, setCurrentPathname] = useState(pathname);
  const [openOverlay, setOpenOverlay] = useState(false);

  useEffect(() => {
    pathname !== currentPathname && setOpenOverlay(false);
    setCurrentPathname(pathname);
  }, [pathname]);

  return (
    <div className={styles['navigation-container']}>
      <nav className={`${openOverlay ? styles['open'] : styles['close']}`}>
        {isAuthenticated ? <NavOptions /> : <AnonymousUserNavOptions />}
      </nav>
      <span
        onClick={(e) => {
          e.stopPropagation();
          setOpenOverlay((state) => !state);
        }}
        role="button"
        className={styles['navigation-overlay-btn']}
      >
        {openOverlay ? (
          <span className="material-symbols-rounded">close</span>
        ) : (
          <span className="material-symbols-rounded">menu</span>
        )}
      </span>
    </div>
  );
};

export default NavigationOverlay;
