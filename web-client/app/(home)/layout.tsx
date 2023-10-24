import Slider from 'src/components/Slider';
import trpc from 'src/trpc/server';
import { AppTabs } from 'src/components/responsive-components';
import { headers } from 'next/headers';
import SlideItem from 'src/components/SlideItem';
import MovieCard from 'src/components/movie-card/MovieCard';
import { Suspense } from 'react';
import SlideSkeleton from 'src/components/SlideSkeleton';
import Slide from 'src/components/Slide';
import { InferQueryOutput } from 'trpc/client/utils';

export const revalidate = 3600;
export const fetchCache = 'force-cache';

async function SlideItems({
  items,
  slideSize,
}: {
  items: InferQueryOutput<'publicMovies'>['homeMovies']['popular'];
  slideSize: 3 | 4 | 5;
}) {
  const movies = await Promise.resolve(items);

  return (
    <Slide slideSize={slideSize}>
      {movies.map((movie) => (
        <SlideItem key={movie.id}>
          <MovieCard movie={movie} />
        </SlideItem>
      ))}
    </Slide>
  );
}

// Base type
async function PopularSlider() {
  const { popular } = await trpc.query('publicMovies', 'homeMovies', undefined);

  return (
    <>
      <Slider title="Popular Movies">
        <Suspense fallback={<SlideSkeleton slideSize={3} />}>
          <SlideItems items={popular} slideSize={3} />
        </Suspense>
      </Slider>
    </>
  );
}

async function TrendingSlider() {
  const { trending } = await trpc.query(
    'publicMovies',
    'homeMovies',
    undefined
  );

  return (
    <>
      <Slider title="Trending Movies">
        <Suspense fallback={<SlideSkeleton slideSize={4} />}>
          <SlideItems items={trending} slideSize={4} />
        </Suspense>
      </Slider>
    </>
  );
}

async function NowPlayingSlider() {
  const { nowPlaying } = await trpc.query(
    'publicMovies',
    'homeMovies',
    undefined
  );

  return (
    <>
      <Slider title="Now Playing">
        <Suspense fallback={<SlideSkeleton slideSize={5} />}>
          <SlideItems items={nowPlaying} slideSize={5} />
        </Suspense>
      </Slider>
    </>
  );
}

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  headers();

  return (
    <>
      <AppTabs currentPath="/" />
      {children}
      <section className="slider-container">
        {/** slider */}
        <section>
          <PopularSlider />
        </section>
      </section>

      {/** Trending Movies */}
      <section className="slider-container">
        {/** slider */}
        <section>
          <TrendingSlider />
        </section>
      </section>

      {/** Now Playing */}
      <section className="slider-container">
        {/** slider */}
        <section>
          <NowPlayingSlider />
        </section>
      </section>
    </>
  );
}
