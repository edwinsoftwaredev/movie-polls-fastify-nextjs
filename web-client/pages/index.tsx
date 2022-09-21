import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { SignIn } from 'components';
import styles from '../styles/Home.module.css';
import { Auth } from 'services';
import { useEffect } from 'react';
import { Session } from 'types';

interface HomeProps {
  session?: Session;
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  req,
  res,
}) => {
  // --- Server Auth flow ---
  // 1. Check that user is authenticated
  // 2. If user is not authenticated then show login components
  // 3. If user is authenticated dont show login components

  // If sessionId cookie is not found, get a new session on client side
  // Session without a sessionId is not an authenticated session
  const { sessionId } = req.cookies;
  if (!sessionId)
    return {
      props: {},
    };

  const headers = new Headers();
  const sessionCookie = `sessionId=${sessionId}`;
  headers.append('Cookie', [sessionCookie].join('; '));

  const session = await Auth.authenticateSession({ headers });

  return {
    props: {
      session,
    },
  };
};

const Home: NextPage<HomeProps> = ({ session }) => {
  const { sessionCSRFToken, user } = session || {};

  // --- Client Auth flow ---
  // 1. get session if there isn't
  // 2. if there is an authenticated user dont show login UI
  // 3. if there isn't an authenticated user show login UI
  useEffect(() => {
    if (!session) {
      const API_HOST_URL = process.env.NEXT_PUBLIC_API_HOST_URL || '';

      fetch(`${API_HOST_URL}/`, { credentials: 'include' });
    }
  }, [session]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <div>
          {user ? (
            <p>
              Welcome <span>{user.name}</span>
            </p>
          ) : (
            <SignIn />
          )}
        </div>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.tsx</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
