import { headers } from 'next/headers';
import { Suspense } from 'react';
import Slider from 'src/components/Slider';
import { trpc } from 'src/trpc/server';

async function PopularSlider() {
  const reqHeaders = headers();
  const { popular } = await trpc.query('movies:homeMovies', reqHeaders);

  return (
    <>
      <Slider items={popular.slice(0, 10)} slideSize={5} />
    </>
  );
}

async function TrendingSlider() {
  const reqHeaders = headers();
  const { trending } = await trpc.query('movies:homeMovies', reqHeaders);

  return (
    <>
      <Slider items={trending} slideSize={5} />
    </>
  );
}

async function NowPlayingSlider() {
  const reqHeaders = headers();
  const { nowPlaying } = await trpc.query('movies:homeMovies', reqHeaders);

  return (
    <>
      <Slider items={nowPlaying} slideSize={5} />
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
          <Suspense fallback={<p>Loading...</p>}>
            {/* @ts-expect-error Server Component */}
            <PopularSlider />
          </Suspense>
        </section>
      </section>

      {/** Trending Movies */}
      <section>
        <article>
          <h2>Trending Movies</h2>
        </article>

        {/** slider */}
        <section>
          <Suspense fallback={<p>Loading...</p>}>
            {/* @ts-expect-error Server Component */}
            <TrendingSlider />
          </Suspense>
        </section>
      </section>

      {/** Now Playing */}
      <section>
        <article>
          <h2>Now Playing</h2>
        </article>

        {/** slider */}
        <section>
          <Suspense fallback={<p>Loading...</p>}>
            {/* @ts-expect-error Server Component */}
            <NowPlayingSlider />
          </Suspense>
        </section>
      </section>
    </>
  );
}
