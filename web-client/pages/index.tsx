import { Account } from 'components';
import styles from '../styles/Home.module.scss';
import trpc from 'src/trpc';
import { NextPageWithLayout } from './_app';
import { ReactElement } from 'react';
import Layout from 'src/components/layout';

const Home: NextPageWithLayout = () => {
  const { data: session } = trpc.useQuery(['session:getSession']);

  const { data: whoamiRes } = trpc.useQuery(['account:whoami'], {
    enabled: session?.isAuthenticated,
  });

  const { whoami } = whoamiRes || {};

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Movie Polls</h1>
        <div>
          {whoami ? (
            <p>
              Welcome <span>{whoami.displayName}</span>
            </p>
          ) : (
            <Account.SignIn />
          )}
        </div>
      </main>
    </div>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
};

export default Home;
