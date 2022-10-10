import createRouter from '../createRouter';

export const account = createRouter().query('whoami', {
  resolve: async ({ ctx }) => {
    const { req, res, fastify } = ctx;

    const userId = req.session.userSession?.userId;

    if (!userId) return { whoami: null };

    const whoami = await fastify.account.user.getUser(userId);

    return { whoami };
  },
});
