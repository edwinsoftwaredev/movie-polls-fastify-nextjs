import Slider from 'src/components/Slider';
import trpc from 'src/trpc/server';

export default async function TopMovies({ d }: { d?: number }) {
  const { popularByGenre } = await trpc.query(
    'publicMovies',
    'popularByDecadeAndGenre',
    { decade: d ?? 2020 }
  );

  return (
    <>
      {popularByGenre.map((genre) => (
        <div key={genre.genre_name} className="slider-container">
          <Slider
            title={genre.genre_name}
            fetchItems={async () => genre.results}
            slideSize={5}
          />
        </div>
      ))}
    </>
  );
}
