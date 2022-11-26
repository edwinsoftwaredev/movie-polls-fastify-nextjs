import { headers } from 'next/headers';
import { Suspense } from 'react';
import Slider from 'src/components/Slider';
import { trpc } from 'src/trpc/server';

async function PopularSlider() {
  const reqHeaders = headers();
  const { popular } = await trpc.query('movies:homeMovies', reqHeaders);

  return (
    <>
      <Slider movies={popular} />
    </>
  );
}

async function TrendingSlider() {
  const reqHeaders = headers();
  const { trending } = await trpc.query('movies:homeMovies', reqHeaders);

  return (
    <>
      <Slider movies={trending} />
    </>
  );
}

async function NowPlayingSlider() {
  const reqHeaders = headers();
  const { nowPlaying } = await trpc.query('movies:homeMovies', reqHeaders);

  return (
    <>
      <Slider movies={nowPlaying} />
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
          <article>
            <Suspense fallback={<p>Loading...</p>}>
              {/* @ts-expect-error Server Component */}
              <PopularSlider />
            </Suspense>
          </article>
        </section>
      </section>

      {/** Trending Movies */}
      <section>
        <article>
          <h2>Trending Movies</h2>
        </article>

        {/** slider*/}
        <section>
          <article>
            <Suspense fallback={<p>Loading...</p>}>
              {/* @ts-expect-error Server Component */}
              <TrendingSlider />
            </Suspense>
          </article>
        </section>
      </section>

      {/** Now Playing */}
      <section>
        <article>
          <h2>Now Playing</h2>
        </article>

        {/** slider */}
        <section>
          <article>
            <Suspense fallback={<p>Loading...</p>}>
              {/* @ts-expect-error Server Component */}
              <NowPlayingSlider />
            </Suspense>
          </article>
        </section>
      </section>
    </>
  );
}
