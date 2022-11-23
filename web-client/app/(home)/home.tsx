import trpcClient from 'src/trpc/server';
import * as React from 'react';
import { headers } from 'next/headers';

export default async function Home() {
  const reqHeaders = headers();
  const trpc = trpcClient(reqHeaders);
  const homeMovies = await trpc.query('movies:homeMovies');

  const { popular, trending, nowPlaying } = homeMovies;

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
            <ul>
              {popular?.map((movie) => (
                <li key={movie.id}>
                  <span>{movie.title}</span>
                </li>
              )) ?? null}
            </ul>
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
            <ul>
              {trending?.map((movie) => (
                <li key={movie.id}>
                  <span>{movie.title}</span>
                </li>
              )) ?? null}
            </ul>
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
            <ul>
              {nowPlaying?.map((movie) => (
                <li key={movie.id}>
                  <span>{movie.title}</span>
                </li>
              )) ?? null}
            </ul>
          </article>
        </section>
      </section>
    </>
  );
}
