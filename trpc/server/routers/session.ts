import createRouter from '../createRouter';

export const session = createRouter().query('getSession', {
  resolve: async ({ ctx }) => {
    const {
      req: { session },
      res,
    } = ctx;

    const csrfToken: string =
      session.userSession?.csrfToken || (await res.generateCsrf());

    const { userSession } = session;

    if (!userSession) return { csrfToken };

    const { userId } = userSession;

    // should return user info
    return { csrfToken, userId };
  },
});
