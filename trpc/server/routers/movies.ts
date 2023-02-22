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
      const { fastify, req } = ctx;
      const {
        session: { userSession },
      } = req;
      const { searchTerm } = input;

      const movies = await fastify.movies.search(userSession!, searchTerm);
      return { movies };
    }),
});

export default router({ movies: moviesRouter });
