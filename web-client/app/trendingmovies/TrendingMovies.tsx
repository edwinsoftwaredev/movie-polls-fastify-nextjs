import { headers } from 'next/headers';
import Slider from 'src/components/Slider';
import { trpc } from 'src/trpc/server';

export default async function TrendingMovies() {
  const reqHeaders = headers();
  const { trendingByGenre } = await trpc.query('movies:trendingByGenre', reqHeaders);

  return (
    <>
      {trendingByGenre?.map((genre) => (
        <div key={genre.genre_name}>
          <article>
            <h2>{genre.genre_name}</h2>
          </article>
          <Slider movies={genre.results} />
        </div>
      )) ?? null}
    </>
  );
}
