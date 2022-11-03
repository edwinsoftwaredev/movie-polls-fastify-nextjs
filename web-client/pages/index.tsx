import { getTRPCClient, trpc } from 'src/trpc';
import { NextPageWithLayout } from './_app';
import { ReactElement } from 'react';
import Layout from 'src/components/layout';
import { GetServerSideProps } from 'next';
import { dehydrate, QueryClient } from 'react-query';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const trpcClient = getTRPCClient({ req });
  const queryClient = new QueryClient();
  const whoamiQueryData = await trpcClient.query('account:whoami');  
  queryClient.setQueryData('account:whoami', whoamiQueryData);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

const Home: NextPageWithLayout = () => {
  const { data: whoamiData } = trpc.useQuery(['account:whoami']);
  const { whoami } = whoamiData || {};

  return (
    <>
      {
        whoami ? (
          <>
            {/** Current polls section */}
            <section>
              <article>
                <h2>Current Polls</h2>
              </article>

              {/** slider */}
              <section />
            </section>

            {/** Top 10 Best Popular */}
            <section>
              <article>
                <h2>Top 10 Best Popular Movies</h2>
              </article>

              {/** slider */}
              <section />
            </section>

            {/** Top 10 Best Trending Movies */}
            <section>
              <article>
                <h2>Top 10 Best Trending Movies</h2>
              </article>

              {/** slider*/}
              <section />
            </section>

            {/** Now Playing */}
            <section>
              <article>
                <h2>Now Playing</h2>
              </article>

              {/** slider */}
              <section />
            </section>
          </>
        ) : (
          <section>
            <span 
              style={{
                textAlign: 'center'
              }}
            >
              <h1>Landing Page</h1>
            </span>
          </section>
        )
      }
    </>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
};

export default Home;
