import { headers } from 'next/headers';
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
      {/** Current polls section */}
      {isAuthenticated ? (
        <section>
          <article>
            <h2>Current Polls</h2>
          </article>

          {/** slider */}
          <section />
        </section>
      ) : null}
      {/** Popular Movies */}
      <section>
        <article>
          <h2>Popular Movies</h2>
        </article>

        {/** slider */}
        <section>
          {/* @ts-expect-error Server Component */}
          <PopularSlider />
        </section>
      </section>

      {/** Trending Movies */}
      <section>
        <article>
          <h2>Trending Movies</h2>
        </article>

        {/** slider */}
        <section>
          {/* @ts-expect-error Server Component */}
          <TrendingSlider />
        </section>
      </section>

      {/** Now Playing */}
      <section>
        <article>
          <h2>Now Playing</h2>
        </article>

        {/** slider */}
        <section>
          {/* @ts-expect-error Server Component */}
          <NowPlayingSlider />
        </section>
      </section>
    </>
  );
}
