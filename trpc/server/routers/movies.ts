import { procedure, router } from '../init-tRPC';
import { z } from 'zod';

// TODO: Remove routes that are already public
const moviesRouter = router({
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

    const trendingByGenre = await fastify.movies.trendingByGenre(p);
    return { trendingByGenre };
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

      const popularByGenre = await fastify.movies.popularByDecadeAndGenre(
        p,
        decade
      );

      return { popularByGenre };
    }),
});

export default router({ movies: moviesRouter });
