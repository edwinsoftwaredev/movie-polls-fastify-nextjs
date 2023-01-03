import { headers } from 'next/headers';
import Slider from 'src/components/Slider';
import { getTRPCClient } from 'src/trpc/server';

export default async function TrendingMovies() {
  const { publicMovies } = getTRPCClient(headers(), 'publicMoviesRoutes');
  const { trendingByGenre } = await publicMovies.trendingByGenre.query();
  console.log(trendingByGenre);

  return (
    <>
      {trendingByGenre?.map((genre) => (
        <div key={genre.genre_name}>
          <article>
            <h2>{genre.genre_name}</h2>
          </article>
          <Slider fetchItems={async () => genre.results} slideSize={5} />
        </div>
      )) ?? null}
    </>
  );
}
