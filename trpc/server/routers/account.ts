import createRouter from '../createRouter';

export const account = createRouter().query('whoami', {
  resolve: async ({ ctx }) => {
    const { req, res, fastify } = ctx;

    const userId = req.session.userSession?.userId;

    if (!userId) return { whoami: null };

    // TODO: type should not be defined but inferrered.
    // If the type is defined, on client side, the return type
    // will be any
    const whoami = await fastify.account.user.getUser(userId);

    return { whoami };
  },
});
