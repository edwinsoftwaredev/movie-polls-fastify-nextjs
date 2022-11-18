import { getTRPCClient, trpc } from 'src/trpc'; 
import { NextPageWithLayout } from './_app';
import { ReactElement } from 'react';
import Layout from 'src/components/layout';
import { GetServerSideProps } from 'next';
import { dehydrate, QueryClient } from 'react-query';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const trpcClient = getTRPCClient({ req });
  const queryClient = new QueryClient();

  // TODO: Refactor
  const sessionQueryData = await trpcClient.query('session:getSession');
  const whoamiQueryData = sessionQueryData.isAuthenticated ? 
    await trpcClient.query('account:whoami') : null;  

  const nowPlayingMoviesData = sessionQueryData.isAuthenticated ? 
    await trpcClient.query('movies:homeMovies') : null;

  queryClient.setQueryData('account:whoami', whoamiQueryData);
  queryClient.setQueryData('session:getSession', sessionQueryData);
  queryClient.setQueryData('movies:homeMovies', nowPlayingMoviesData);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

const Home: NextPageWithLayout = () => {
  const { data: whoamiData } = trpc.useQuery(['account:whoami']);
  const { whoami } = whoamiData || {};

  const { data: nowPlayingData } = trpc.useQuery(['movies:homeMovies'], {
    enabled: !!whoami,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const { popular, trending, nowPlaying } = nowPlayingData || {};

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

            {/** Popular Movies */}
            <section>
              <article>
                <h2>Popular Movies</h2>
              </article>

              {/** slider */}
              <section>
                <article>
                  <ul>
                    {
                      popular?.map(movie => (
                        <li key={movie.id}>
                          <span>{movie.title}</span>
                        </li>
                      )) ?? null
                    }
                  </ul>
                </article>
              </section>
            </section>

            {/** Trending Movies */}
            <section>
              <article>
                <h2>Trending Movies</h2>
              </article>

              {/** slider*/}
              <section>
                <article>
                  <ul>
                    {
                      trending?.map(movie => (
                        <li key={movie.id}>
                          <span>{movie.title}</span>
                        </li>
                      )) ?? null
                    }
                  </ul>
                </article>
              </section>
            </section>

            {/** Now Playing */}
            <section>
              <article>
                <h2>Now Playing</h2>
              </article>

              {/** slider */}
              <section>
                <article>
                  <ul>
                    {
                      nowPlaying?.map(movie => (
                        <li key={movie.id}>
                          <span>{movie.title}</span>
                        </li>
                      )) ?? null
                    }
                  </ul>
                </article>
              </section>
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
