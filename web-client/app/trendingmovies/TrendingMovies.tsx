import { headers } from 'next/headers';
import Slider from 'src/components/Slider';
import trpc from 'src/trpc/server';

export default async function TrendingMovies() {
  const { trendingByGenre } = await trpc.query(
    'publicMovies',
    'trendingByGenre',
    undefined,
    headers()
  );

  return (
    <>
      {trendingByGenre.map((genre) => (
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
