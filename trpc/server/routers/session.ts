import createRouter from '../createRouter';

const session = createRouter().query('getSession', {
  resolve: async ({ ctx }) => {
    const {
      req: { session },
      res,
    } = ctx;

    const csrfToken: string = await res.generateCsrf();

    const { userSession } = session;

    if (!userSession) return { csrfToken };

    const { userId } = userSession;

    return { csrfToken, isAuthenticated: !!userId };
  },
});

const sessionRouter = createRouter().merge('session:', session);

export type SessionRouter = typeof sessionRouter;
export default sessionRouter;
