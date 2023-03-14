import { Suspense } from 'react';
import MovieCard from 'src/components/movie-card/MovieCard';
import Slide from 'src/components/Slide';
import SlideItem from 'src/components/SlideItem';
import Slider from 'src/components/Slider';
import SlideSkeleton from 'src/components/SlideSkeleton';
import trpc from 'src/trpc/server';

const getData = async (d?: number) => {
  const { popularByGenre } = await trpc.query(
    'publicMovies',
    'popularByDecadeAndGenre',
    { decade: d ?? 2020 }
  );
  return popularByGenre;
};

export async function SlideItems({
  items,
}: {
  items: Awaited<ReturnType<typeof getData>>['0']['results'];
}) {
  const movies = await Promise.resolve(items);

  return (
    <Slide slideSize={5}>
      {movies.map((movie) => (
        <SlideItem key={movie.id}>
          <MovieCard movie={movie} />
        </SlideItem>
      ))}
    </Slide>
  );
}

export default async function TopMovies({ d }: { d?: number }) {
  const popularByGenre = await getData(d);

  return (
    <>
      {popularByGenre.map((genre) => (
        <div key={genre.genre_name} className="slider-container">
          <Slider title={genre.genre_name}>
            <Suspense fallback={<SlideSkeleton slideSize={5} />}>
              {/* @ts-expect-error Server Component */}
              <SlideItems items={genre.results} />
            </Suspense>
          </Slider>
        </div>
      ))}
    </>
  );
}
