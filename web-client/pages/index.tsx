import { Account } from 'components';
import styles from '../styles/Home.module.scss';
import { getTRPCClient, trpc } from 'src/trpc';
import { NextPageWithLayout } from './_app';
import { ReactElement } from 'react';
import Layout from 'src/components/layout';
import { GetServerSideProps } from 'next';
import { dehydrate, QueryClient } from 'react-query';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const trpcClient = getTRPCClient({ req });
  const queryClient = new QueryClient();
  const sessionQueryData = await trpcClient.query('session:getSession');
  const whoamiQueryData = await trpcClient.query('account:whoami');
  queryClient.setQueryData('session:getSession', sessionQueryData);
  queryClient.setQueryData('account:whoami', whoamiQueryData);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

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
