import createRouter from '../createRouter';

const account = createRouter().query('whoami', {
  resolve: async ({ ctx }) => {
    const { req, res, fastify } = ctx;

    const userId = req.session.userSession?.userId;

    if (!userId) return { whoami: null };

    const whoami = await fastify.account.user.getUser(userId);

    return { whoami };
  },
});

const accountRouter = createRouter().merge('account:', account);

export type AccountRouter = typeof accountRouter;
export default accountRouter;
