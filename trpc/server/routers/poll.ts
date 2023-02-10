import { procedure, router } from '../init-tRPC';

const pollRouter = router({
  inactivePolls: procedure.query(async ({ ctx }) => {
    const { fastify, req } = ctx;
    const userId = req.session.userSession?.userId;
    if (!userId) return { polls: [] };

    const polls = await fastify.polls.getInactivePolls(userId);

    return { polls };
  }),
});

export default router({ poll: pollRouter });
