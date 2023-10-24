import { Voltaire } from 'next/font/google';
import styles from './About.module.scss';
import { JustWatchLogo, TMBDLogo } from 'src/components/logos';

export const dynamic = 'force-static';

export const metadata = {
  title: 'About',
};

const voltaire = Voltaire({
  subsets: ['latin'],
  weight: '400',
});

export default async function Page() {
  return (
    <section className={styles['about']}>
      <h2>About</h2>
      <section className={styles['content']}>
        <p className={styles['about-text']}>
          <span
            className={`app-title ${styles['app-title']} ${voltaire.className}`}
          >
            Movie Polls{' '}
          </span>
          allows you to create movie polls and invite your contacts to
          participate.
          <b />
        </p>
        <ul>
          <li>You are allowed to create up to 50 movie polls</li>
          <li>Each movie poll has a limit of 5 movies</li>
          <li>
            {`Each movie poll has a limit of 50 invites that you can share to your
            contacts (to participate in a poll is not necessary to sign-up)`}
          </li>
        </ul>
      </section>
      <article className={styles['attribution']}>
        <h3>Attribution</h3>
        <section className={styles['attribution-content']}>
          <ul>
            <li>
              <p>
                <span style={{ verticalAlign: 'middle' }}>
                  <TMBDLogo width="8em" />
                </span>
              </p>
              <p>
                This product uses the TMDB API but is not endorsed or certified
                by TMDB.
              </p>
            </li>
            <li>
              <p>
                <span style={{ verticalAlign: 'middle' }}>
                  <JustWatchLogo width="8em" />
                </span>
              </p>
              <p>Data about movie providers sourced from JustWatch.</p>
            </li>
          </ul>
        </section>
      </article>
    </section>
  );
}
