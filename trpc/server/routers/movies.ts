import { z } from 'zod';
import { procedure, router } from '../init-tRPC';

const moviesRouter = router({
  search: procedure
    .input(
      z.object({
        searchTerm: z.string().min(1).max(255),
      })
    )
    .query(async ({ ctx, input }) => {
      const { fastify } = ctx;
      const { searchTerm } = input;

      const movies = await fastify.movies.search(searchTerm);
      return { movies };
    }),
});

export default router({ movies: moviesRouter });
