import React from 'react';
import Link from 'next/link';
import style from './footer.module.scss';
import { Voltaire } from 'next/font/google';
import { TMBDLogo } from 'src/components/logos';

const voltaire = Voltaire({
  subsets: ['latin'],
  weight: '400',
});

export default function Footer() {
  return (
    <footer id="app-footer" className={style['footer']}>
      <section>
        <article>
          <div className={style['main-footer']}>
            <div>
              <Link href={'/'}>
                <h1 className={`${voltaire.className} app-title`}>
                  Movie Polls
                </h1>
              </Link>
              <p>Movie polls Made Easy.</p>
            </div>
            <div />
            <nav>
              <h2>Movie Polls</h2>
              <ul>
                <li>
                  <Link href={'/about'}>About</Link>
                </li>
                <li>
                  <Link href={'/contact'}>Contact</Link>
                </li>
              </ul>
            </nav>
          </div>
        </article>
      </section>
      <section className={style['tmdb-attribution']}>
        <article style={{ textAlign: 'center' }}>
          <p>
            <span style={{ verticalAlign: 'middle' }}>
              <TMBDLogo width="7.25em" />
            </span>
          </p>
          <p>
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </p>
        </article>
      </section>
    </footer>
  );
}
