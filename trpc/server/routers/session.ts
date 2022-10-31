import createRouter from '../createRouter';

const session = createRouter().query('getSession', {
  resolve: async ({ ctx }) => {
    const {
      req: { session },
      res,
      fastify
    } = ctx;

    fastify.log.info('Routing session...');
    
    const csrfToken: string = await res.generateCsrf();

    const { userSession } = session;
    const { userId } = userSession || {};

    return { csrfToken, isAuthenticated: !!userId };
  },
});

const sessionRouter = createRouter().merge('session:', session);
export default sessionRouter;
