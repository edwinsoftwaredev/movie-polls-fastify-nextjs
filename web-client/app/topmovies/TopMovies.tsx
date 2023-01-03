import { headers } from 'next/headers';
import Slider from 'src/components/Slider';
import { getTRPCClient } from 'src/trpc/server';

export default async function TopMovies() {
  const { publicMovies } = getTRPCClient(headers(), 'publicMoviesRoutes');
  const { popularByGenre } = await publicMovies.popularByDecadeAndGenre.query({
    decade: 2020,
  });

  return (
    <>
      {popularByGenre.map((genre) => (
        <div key={genre.genre_name}>
          <article>
            <h2>{genre.genre_name}</h2>
          </article>
          <Slider fetchItems={async () => genre.results} slideSize={5} />
        </div>
      ))}
    </>
  );
}
