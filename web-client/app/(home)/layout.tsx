import Slider from 'src/components/Slider';
import trpc from 'src/trpc/server';
import { AppTabs } from 'src/components/responsive-components';
import { headers } from 'next/headers';

// Base type
async function PopularSlider() {
  return (
    <>
      <Slider
        fetchItems={async () => {
          const { popular } = await trpc.query(
            'publicMovies',
            'homeMovies',
            undefined
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
            undefined
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
            undefined
          );
          return nowPlaying;
        }}
        title="Now Playing"
        slideSize={5}
      />
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
