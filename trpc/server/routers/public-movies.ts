import { procedure, router } from '../init-tRPC';
import { z } from 'zod';

const publicMoviesRouter = router({
  homeMovies: procedure.query(async ({ ctx }) => {
    const { fastify } = ctx;
    const p = fastify.redisClient.pipeline();

    fastify.movies.nowPlaying(p);
    fastify.movies.popular(p);
    fastify.movies.trending(p);

    const result = await p.exec<
      [
        Awaited<ReturnType<typeof fastify.movies.nowPlaying>>,
        Awaited<ReturnType<typeof fastify.movies.popular>>,
        Awaited<ReturnType<typeof fastify.movies.trending>>
      ]
    >();

    return {
      nowPlaying: result[0],
      popular: result[1],
      trending: result[2],
    };
  }),
  trendingByGenre: procedure.query(async ({ ctx }) => {
    const { fastify } = ctx;
    const p = fastify.redisClient.pipeline();
    fastify.movies.trendingByGenre(p);
    const result = await p.exec<
      [Awaited<ReturnType<typeof fastify.movies.trendingByGenre>>]
    >();
    return { trendingByGenre: result[0] };
  }),
  popularByDecadeAndGenre: procedure
    .input(
      z.object({
        decade: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { fastify } = ctx;
      const { decade } = input;

      const p = fastify.redisClient.pipeline();
      fastify.movies.popularByDecadeAndGenre(p, decade);
      const result = await p.exec<
        [Awaited<ReturnType<typeof fastify.movies.popularByDecadeAndGenre>>]
      >();

      return { popularByGenre: result[0] };
    }),
  movieDetails: procedure
    .input(
      z.object({
        movieId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { fastify } = ctx;
      const { movieId } = input;
      const movieDetails = await fastify.movies.movieDetails(movieId);
      return { movieDetails };
    }),
});

export default router({ publicMovies: publicMoviesRouter });
