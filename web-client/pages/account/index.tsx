import { NextPageWithLayout } from 'pages/_app';
import { ReactElement } from 'react';
import Layout from 'src/components/layout';
import style from './account.module.scss';
import { GetServerSideProps } from 'next';
import { getTRPCClient, trpc } from 'src/trpc';
import { dehydrate, QueryClient } from 'react-query';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const trpcClient = getTRPCClient({ req });
  const queryClient = new QueryClient();
  const sessionQueryData = await trpcClient.query('session:getSession');
  const whoamiQueryData = await trpcClient.query('account:whoami');
  queryClient.setQueryData('session:getSession', sessionQueryData);
  queryClient.setQueryData('account:whoami', whoamiQueryData);

  const { isAuthenticated } = sessionQueryData;

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    },
    ...(!isAuthenticated ? {redirect: { destination: '/', permanent: false }} : {})
  };
};

const Account: NextPageWithLayout = () => {
  const { data: sessionData } = trpc.useQuery(['session:getSession']);
  const { data: whoamiData } = trpc.useQuery(['account:whoami']);

  sessionData;
  whoamiData;

  return (
    <div className={style['main']}>
      <span>Account</span>
    </div>
  );
};

Account.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Account;
