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
    <section>
      <article>
        {
          whoami ? (
            <h2>Welcome <span>{whoami.displayName}</span></h2>
          ) : (
            <>
              <span   
                style={{textAlign: 'center'}}
              >
                <h2>You are not authenticated</h2>
              </span>
              <Account.SignIn />
            </>
          )
        }
      </article>
    </section>
  );
};

SignIn.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
}

export default SignIn;
