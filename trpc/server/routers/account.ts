import createRouter from '../createRouter';

const account = createRouter().query('whoami', {
  resolve: async ({ ctx }) => {
    const { req, fastify } = ctx;

    const userId = req.session.userSession?.userId;

    if (!userId) return { whoami: null };

    const whoami = await fastify.account.user.getUser(userId);

    return { whoami };
  },
});

const accountRouter = createRouter().merge('account:', account);
export default accountRouter;
