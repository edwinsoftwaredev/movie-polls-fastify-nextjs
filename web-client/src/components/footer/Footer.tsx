import React from 'react';
import TMBDLogo from 'public/tmdb-logos/blue_short.svg'
import Link from 'next/link';
import style from './Footer.module.scss';

const Footer: React.FC = () => {
  return (
    <footer className={style['footer']}>
      <section>
        <article>
          <div
            className={style['main-footer']}
          >
            <div>
              <Link
                href={'/'}
              >
                <a>
                  <h1 className={'app-title'}>Movie Polls</h1>
                </a>
              </Link>
              <p>Movie polls Made Easy.</p>
            </div>
            <div />
            <nav>
              <h2>Movie Polls</h2>
              <ul>
                <li>
                  <Link href={'/about'}>
                    <a>About</a>
                  </Link>
                </li>
                <li>
                  <Link href={'/contact'}>
                    <a>Contact</a>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </article>
      </section>
      <section
        className={style['tmdb-attribution']}
      >
        <article
          style={{textAlign: 'center'}}
        >
          <p>
            <span 
              style={{verticalAlign: 'middle'}}
            > 
              Powered by <TMBDLogo width='5.5rem' />
            </span>
          </p>
          <p>
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </article>
      </section>
    </footer>
  );
};

export default Footer;
