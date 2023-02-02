import { headers } from 'next/headers';
import Slider from 'src/components/Slider';
import trpc from 'src/trpc/server';

export default async function TopMovies({ d }: { d?: number }) {
  const { popularByGenre } = await trpc.query(
    'publicMovies',
    'popularByDecadeAndGenre',
    { decade: d ?? 2020 },
    headers()
  );

  return (
    <>
      {popularByGenre.map((genre) => (
        <div key={genre.genre_name} className="slider-container">
          <article>
            <h2>{genre.genre_name}</h2>
          </article>
          <Slider fetchItems={async () => genre.results} slideSize={5} />
        </div>
      ))}
    </>
  );
}
