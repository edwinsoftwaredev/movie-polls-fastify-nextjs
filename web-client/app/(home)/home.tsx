import { headers } from 'next/headers';
import Slider from 'src/components/Slider';
import { getTRPCClient } from 'src/trpc/server';

async function PopularSlider() {
  return (
    <>
      <Slider
        fetchItems={async () => {
          const { publicMovies } = getTRPCClient(
            headers(),
            'publicMoviesRoutes'
          );
          const { popular } = await publicMovies.homeMovies.query();
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
          const { publicMovies } = getTRPCClient(
            headers(),
            'publicMoviesRoutes'
          );
          const { trending } = await publicMovies.homeMovies.query();
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
          const { publicMovies } = getTRPCClient(
            headers(),
            'publicMoviesRoutes'
          );
          const { nowPlaying } = await publicMovies.homeMovies.query();
          return nowPlaying;
        }}
        slideSize={5}
      />
    </>
  );
}

export default async function Home() {
  return (
    <>
      {/** Current polls section */}
      <section>
        <article>
          <h2>Current Polls</h2>
        </article>

        {/** slider */}
        <section />
      </section>

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
