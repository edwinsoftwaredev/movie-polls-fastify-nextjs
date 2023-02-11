import { z } from 'zod';
import { procedure, router } from '../init-tRPC';

const pollRouter = router({
  inactivePolls: procedure.query(async ({ ctx }) => {
    const { fastify, req } = ctx;
    const userId = req.session.userSession?.userId;
    if (!userId) return { polls: [] };

    const polls = await fastify.polls.getInactivePolls(userId);

    return { polls };
  }),
  createPoll: procedure
    .input(
      z.object({
        name: z.string(),
        movieId: z.optional(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fastify, req } = ctx;
      const { movieId, name } = input;
      const userId = req.session.userSession?.userId;
      if (!userId) return { poll: undefined };

      const poll = await fastify.polls.createPoll(userId, name, movieId);

      return { poll };
    }),
});

export default router({ poll: pollRouter });
