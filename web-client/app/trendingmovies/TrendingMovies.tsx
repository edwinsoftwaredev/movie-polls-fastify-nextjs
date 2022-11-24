import { headers } from "next/headers";
import Slider from "src/components/Slider";
import trpcServerClient from "src/trpc/server";

export default async function TrendingMovies() {
  const reqHeaders = headers();
  const trpc = trpcServerClient(reqHeaders);
  const { trendingByGenre } = await trpc.query('movies:trendingByGenre');

  return (
    <>
      {trendingByGenre?.map((genre) => (
        <div key={genre.genre_name}>
          <h3>{genre.genre_name}</h3>
          <Slider movies={genre.results} />
        </div>
      )) ?? null}
    </>
  );
}
