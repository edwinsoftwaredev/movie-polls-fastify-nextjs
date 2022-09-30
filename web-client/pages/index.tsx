import type { NextPage } from 'next';
import Head from 'next/head';
import { Account, Footer } from 'components';
import styles from '../styles/Home.module.css';
import { trpc } from 'src/trpc';

const Home: NextPage = () => {
  // --- Server Auth flow ---
  // 1. Check that user is authenticated (that there is session or sessionId cookie)
  // 2. If user is not authenticated then show login components
  // 3. If user is authenticated dont show login components

  // --- Client Auth flow ---
  // 1. Get session if there isn't (make the request on client side to the api)
  // 2. If there is an authenticated user dont show login UI
  // 3. If there isn't an authenticated user show login UI

  /**
   * --- NOTE ---
   * The Next.js's logic that includes getServerSideProps or getStaticProps
   * and client side is handle by tRPC and React-Query
   */
  const { data: session } = trpc.useQuery(['session:getSession'], {
    // TODO: Update configuration
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  const { userId, csrfToken } = session || {};

  return (
    <div className={styles.container}>
      <Head>
        <title>Movie Polls</title>
        <meta
          name="description"
          content="Create movie polls and let everyone decide the winner."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Movie Polls</h1>

        <div>
          {userId ? (
            <p>
              Welcome <span>{userId}</span>
            </p>
          ) : (
            <Account.SignIn />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
