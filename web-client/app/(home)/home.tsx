import { headers } from 'next/headers';
import CurrentPolls from 'src/components/current-polls/CurrentPolls';
import { AppTabs } from 'src/components/responsive-components';
import Slider from 'src/components/Slider';
import trpc from 'src/trpc/server';

// Base type
async function PopularSlider() {
  return (
    <>
      <Slider
        fetchItems={async () => {
          const { popular } = await trpc.query(
            'publicMovies',
            'homeMovies',
            undefined,
            headers()
          );
          return popular;
        }}
        title="Popular Movies"
        slideSize={3}
      />
    </>
  );
}

async function TrendingSlider() {
  return (
    <>
      <Slider
        fetchItems={async () => {
          const { trending } = await trpc.query(
            'publicMovies',
            'homeMovies',
            undefined,
            headers()
          );
          return trending;
        }}
        title="Trending Movies"
        slideSize={4}
      />
    </>
  );
}

async function NowPlayingSlider() {
  return (
    <>
      <Slider
        fetchItems={async () => {
          const { nowPlaying } = await trpc.query(
            'publicMovies',
            'homeMovies',
            undefined,
            headers()
          );
          return nowPlaying;
        }}
        title="Now Playing"
        slideSize={5}
      />
    </>
  );
}

export default async function Home() {
  const { isAuthenticated } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );

  return (
    <>
      <AppTabs currentPath="/" />
      {/** Current polls section */}
      {isAuthenticated ? (
        <section className="slider-container">
          <CurrentPolls />

          {/** slider */}
          <section />
        </section>
      ) : null}
      {/** Popular Movies */}
      <section className="slider-container">
        {/** slider */}
        <section>
          {/* @ts-expect-error Server Component */}
          <PopularSlider />
        </section>
      </section>

      {/** Trending Movies */}
      <section className="slider-container">
        {/** slider */}
        <section>
          {/* @ts-expect-error Server Component */}
          <TrendingSlider />
        </section>
      </section>

      {/** Now Playing */}
      <section className="slider-container">
        {/** slider */}
        <section>
          {/* @ts-expect-error Server Component */}
          <NowPlayingSlider />
        </section>
      </section>
    </>
  );
}
