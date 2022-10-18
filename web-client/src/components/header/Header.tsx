import Link from 'next/link';
import trpc from 'src/trpc';
import style from './Header.module.scss';

const AnonymousUserNavOptions: React.FC = () => (
  <ul>
    <li>
      <Link href='/about'>
        <a>About</a>
      </Link>
    </li>
    <li>
      <Link href='/contact'>
        <a>Contact</a>
      </Link>
    </li>
    <hr />
    <li>
      <Link href='/signin'>
        <a>Sign In</a>
      </Link>
    </li>
  </ul>
);

const NavOptions: React.FC = () => (
  <ul>
    <li>
      <Link href='/search'>
        <a>Search</a>
      </Link>
    </li>
    <li>
      <Link href='/home'>
        <a>Home</a>
      </Link>
    </li>
    <li>
      <Link href='/top-movies'>
        <a>Top Movies</a>
      </Link>
    </li>
    <li>
      <Link href='/trending-movies'>
        <a>Trending Movies</a>
      </Link>
    </li>
    <li>
      <Link href='/my-polls'>
        <a>My Polls</a>
      </Link>
    </li>

    <hr />

    <li>
      <Link href='/account'>
        <a>Account</a>
      </Link>
    </li>
    <li>
      <Link href='/signout'>
        <a>Sign Out</a>
      </Link>
    </li>
  </ul>
);

const Header: React.FC = () => {
  const { data: sessionData, isFetched } = trpc.useQuery(['session:getSession'], {
    // Setting ssr to false due to this component not being a page
    // and not being in a page
    ssr: false,
  });

  const { isAuthenticated } = sessionData || {};


  return (
    <div className={style['container']}>
      <header className={style['header']}>
        <h1>Movie Polls</h1>
        <div />
        {
          isFetched ? (
            <nav>
              {
                isAuthenticated ? <NavOptions /> : <AnonymousUserNavOptions />
              }
            </nav>
          ) : <div />
        }
      </header>
    </div>
  )
};

export default Header;