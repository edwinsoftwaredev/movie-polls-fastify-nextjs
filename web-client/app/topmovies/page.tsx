import { redirect } from 'next/navigation';
import trpc from 'src/trpc/server';

export default async function Page() {
  const session = await trpc.query('session:getSession');
  const { isAuthenticated } = session;

  if (!isAuthenticated) {
    redirect('/');
  }

  const { popularByGenre } = await trpc.query(
    'movies:popularByDecadeAndGenre',
    { decade: 2020 }
  );

  return (
    <>
      <section>
        <article>
          <h2>{`${2020}'s Popular Movies`}</h2>
        </article>

        {/** slider*/}
        <section>
          <article>
            {popularByGenre?.map((genre) => (
              <div key={genre.genre_name}>
                <h3>{genre.genre_name}</h3>
                <ul>
                  {genre.results.map((movie) => (
                    <li key={movie.id}>{movie.title}</li>
                  ))}
                </ul>
              </div>
            )) ?? null}
          </article>
        </section>
      </section>
    </>
  );
}
