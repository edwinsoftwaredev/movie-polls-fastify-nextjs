import trpc from 'src/trpc/server';
import style from './header.module.scss';
import SearchVector from 'public/vectors/search.svg';
import Link from 'next/link';
import { Voltaire } from '@next/font/google';

const voltaire = Voltaire({
  weight: '400',
});

const AnonymousUserNavOptions: React.FC = () => (
  <ul>
    <li>
      <Link href="/about">About</Link>
    </li>
    <li>
      <Link href="/contact">Contact</Link>
    </li>
    <hr />
    <li>
      <Link href="/signin">Sign In</Link>
    </li>
  </ul>
);

const NavOptions: React.FC = () => (
  <ul>
    <li>
      <Link href="/search">
        <div className={style['search-vector']}>
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

export default async function Header() {
  const session = await trpc.query('session:getSession');

  const { isAuthenticated } = session;

  return (
    <div className={style['container']}>
      <header className={style['header']}>
        <Link href={'/'}>
          <h1 className={`${voltaire.className} app-title`}>Movie Polls</h1>
        </Link>
        <div />
        {
          <nav>
            {isAuthenticated ? <NavOptions /> : <AnonymousUserNavOptions />}
          </nav>
        }
      </header>
    </div>
  );
}
