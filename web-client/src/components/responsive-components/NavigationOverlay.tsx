'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchVector from 'public/vectors/search.svg';
import { useEffect, useState } from 'react';
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

const NavOptions: React.FC = () => (
  <ul>
    <li>
      <Link href="/search">
        <div className={styles['search-vector']}>
          <SearchVector />
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
      <Link href="/signout">Sign Out</Link>
    </li>
  </ul>
);

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
