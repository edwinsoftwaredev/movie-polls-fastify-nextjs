import createRouter from '../createRouter';
import { z } from 'zod';

const publicMovies = createRouter()
  .query('homeMovies', {
    resolve: async ({ ctx }) => {
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
    },
  })
  .query('trendingByGenre', {
    resolve: async ({ ctx }) => {
      const { fastify } = ctx;
      const trendingByGenre = await fastify.movies.trendingByGenre();
      return { trendingByGenre };
    },
  })
  .query('popularByDecadeAndGenre', {
    input: z.object({
      decade: z.number(),
    }),
    resolve: async ({ ctx, input }) => {
      const { fastify } = ctx;
      const { decade } = input;
      const popularByGenre = await fastify.movies.popularByDecadeAndGenre(
        decade
      );

      return { popularByGenre };
    },
  });

const publicMoviesRouter = createRouter().merge('publicMovies:', publicMovies);
export default publicMoviesRouter;
