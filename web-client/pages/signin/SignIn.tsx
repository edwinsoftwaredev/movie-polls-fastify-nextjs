import { Account } from "components";
import { GetServerSideProps } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";
import { dehydrate, QueryClient } from "react-query";
import Layout from "src/components/layout";
import { getTRPCClient, trpc } from "src/trpc";
import style from './SignIn.module.scss';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const trpcClient = getTRPCClient({ req }); 
  const queryClient = new QueryClient();
  const whoamiQueryData = await trpcClient.query('account:whoami');
  const sessionQueryData = await trpcClient.query('session:getSession');
  queryClient.setQueryData('account:whoami', whoamiQueryData);
  queryClient.setQueryData('session:getSession', sessionQueryData);

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  }
};

const SignIn: NextPageWithLayout = () => {
  const { data: sessionData } = trpc.useQuery(['session:getSession']);
  const { data: whoamiData } = trpc.useQuery(['account:whoami'], {
    enabled: sessionData?.isAuthenticated
  });

  const { whoami } = whoamiData || {};

  return (
    <div className={style['main']}>
      <div>
        {
          whoami ? (
            <p>
              Welcome <span>{whoami.displayName}</span>
            </p>
          ) : <Account.SignIn />
        }
      </div>
    </div>
  );
};

SignIn.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
}

export default SignIn;
