import { GetServerSideProps } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";
import { dehydrate, QueryClient } from "react-query";
import Layout from "src/components/layout";
import { getTRPCClient, trpc } from "src/trpc";
import style from './topmovies.module.scss';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const trpcClient = getTRPCClient({ req });
  const queryClient = new QueryClient();

  // TODO: Refactor
  const sessionQueryData = await trpcClient.query('session:getSession');
  const { isAuthenticated } = sessionQueryData;
  const popularByGenre = isAuthenticated ? 
    await trpcClient.query('movies:popularByDecadeAndGenre', { decade: 2020 }) : null;

  queryClient.setQueryData('movies:popularByDecadeAndGenre', popularByGenre);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    ...(!isAuthenticated ? {redirect: { destination: '/', permanent: false }} : {})
  }
}

const TopMovies: NextPageWithLayout = () => {
  const { data: popularByGenreData } = trpc.useQuery(['movies:popularByDecadeAndGenre', { decade: 2020 }], {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const { popularByGenre } = popularByGenreData || {};

  return (
    <>
      <section>
        <article>
          <h2>{`${2020}'s Popular Movies`}</h2>
        </article>

        {/** slider*/}
        <section>
          <article>
            {
              popularByGenre?.map(genre => (
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

TopMovies.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>);
};

export default TopMovies;
