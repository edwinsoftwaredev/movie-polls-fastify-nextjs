import { headers } from 'next/headers';
import Slider from 'src/components/Slider';
import { trpc } from 'src/trpc/server';

export default async function TopMovies() {
  const reqHeaders = headers();
  const { popularByGenre } = await trpc.query(
    'movies:popularByDecadeAndGenre',
    reqHeaders,
    { decade: 2020 },
  );

  return (
    <>
      {popularByGenre.map((genre) => (
        <div key={genre.genre_name}>
          <article>
            <h2>{genre.genre_name}</h2>
          </article>
          <Slider movies={genre.results} />
        </div>
      ))}
    </>
  );
}
