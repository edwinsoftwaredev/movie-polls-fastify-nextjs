import { procedure, router } from '../init-tRPC';
import { z } from 'zod';

const publicMoviesRouter = router({
  homeMovies: procedure.query(async ({ ctx }) => {
    const { fastify } = ctx;
    return fastify.movies.homeMoviesVM();
  }),

  trendingByGenre: procedure.query(async ({ ctx }) => {
    const { fastify } = ctx;
    return fastify.movies.trendingByGenreVM();
  }),

  popularByDecadeAndGenre: procedure
    .input(z.object({ decade: z.number() }))
    .query(async ({ input, ctx }) => {
      const { fastify } = ctx;
      const { decade } = input;
      return fastify.movies.popularByDecadeAndGenreVM(decade);
    }),

  movie: procedure
    .input(z.object({ movieId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { fastify } = ctx;
      const { movieId } = input;
      const movie = await fastify.movies.movie(movieId);
      return { movie };
    }),

  movieDetails: procedure
    .input(z.object({ movieId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { fastify } = ctx;
      const { movieId } = input;
      const movieDetails = await fastify.movies.movieDetails(movieId);
      return { movieDetails };
    }),

  movieProviders: procedure
    .input(z.object({ movieId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { fastify } = ctx;
      const { movieId } = input;
      const movieProviders = await fastify.movies.movieProviders(movieId);
      return { movieProviders };
    }),
});

export default router({ publicMovies: publicMoviesRouter });
