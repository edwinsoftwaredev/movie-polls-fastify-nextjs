import Slider from 'src/components/Slider';
import trpc from 'src/trpc/server';

export default async function TrendingMovies() {
  const { trendingByGenre } = await trpc.query(
    'publicMovies',
    'trendingByGenre',
    undefined
  );

  return (
    <>
      {trendingByGenre.map((genre) => (
        <div key={genre.genre_name} className="slider-container">
          <Slider
            title={genre.genre_name}
            fetchItems={async () => genre.results}
            slideSize={5}
          />
        </div>
      )) ?? null}
    </>
  );
}
