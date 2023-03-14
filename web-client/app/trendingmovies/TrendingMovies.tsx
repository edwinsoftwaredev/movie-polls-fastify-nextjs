import { Suspense } from 'react';
import MovieCard from 'src/components/movie-card/MovieCard';
import Slide from 'src/components/Slide';
import SlideItem from 'src/components/SlideItem';
import Slider from 'src/components/Slider';
import SlideSkeleton from 'src/components/SlideSkeleton';
import trpc from 'src/trpc/server';

const getData = async () => {
  const { trendingByGenre } = await trpc.query(
    'publicMovies',
    'trendingByGenre',
    undefined
  );
  return trendingByGenre;
};

async function SlideItems({
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

export default async function TrendingMovies() {
  const trendingByGenre = await getData();

  return (
    <>
      {trendingByGenre.map((genre) => (
        <div key={genre.genre_name} className="slider-container">
          <Slider title={genre.genre_name}>
            <Suspense fallback={<SlideSkeleton slideSize={5} />}>
              {/* @ts-expect-error Server Component */}
              <SlideItems items={genre.results} />
            </Suspense>
          </Slider>
        </div>
      )) ?? null}
    </>
  );
}
