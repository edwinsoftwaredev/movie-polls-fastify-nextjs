import { GetServerSideProps } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";
import { dehydrate, QueryClient } from "react-query";
import Layout from "src/components/layout";
import { getTRPCClient, trpc } from "src/trpc";
import style from './trendingmovies.module.scss';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const trpcClient = getTRPCClient({ req });
  const queryClient = new QueryClient();

  // TODO: Refactor
  const sessionQueryData = await trpcClient.query('session:getSession');
  const { isAuthenticated } = sessionQueryData;
  const nowPlayingMoviesData = isAuthenticated ? 
    await trpcClient.query('movies:trendingByGenre') : null;

  queryClient.setQueryData('movies:trendingByGenre', nowPlayingMoviesData);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    ...(!isAuthenticated ? {redirect: { destination: '/', permanent: false }} : {})
  }
}

const TrendingMovies: NextPageWithLayout = () => {
  const { data: trendingByGenreData } = trpc.useQuery(['movies:trendingByGenre'], {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const { trendingByGenre } = trendingByGenreData || {};

  return (
    <>
      <section>
        <article>
          <h2>Trending Movies</h2>
        </article>

        {/** slider*/}
        <section>
          <article>
            {
              trendingByGenre?.map(genre => (
                <div key={genre.genre_name}>
                  <h3>{genre.genre_name}</h3>
                  <ul>
                    {
                      genre.results.map(movie => (
                        <li key={movie.id}>{movie.title}</li>
                      ))
                    }
                  </ul>
                </div>
              )) ?? null
            }
          </article>
        </section>
      </section>
    </>
  );
}

TrendingMovies.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
}

export default TrendingMovies;
