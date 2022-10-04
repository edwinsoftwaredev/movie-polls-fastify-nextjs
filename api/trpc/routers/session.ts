import createRouter from 'trpc/createRouter';
import { Session } from '@prisma/client';

export const session = createRouter().query('getSession', {
  resolve: async ({ input, ctx }) => {
    const {
      req: { session },
      res,
    } = ctx;

    const csrfToken: string =
      session.userSession.csrfToken || (await res.generateCsrf());

    const { userSession } = session;

    if (!userSession) return { csrfToken };

    // --- Workaround ---
    // The entity Session has the same
    // name as the Fastify/session plugin type,
    // in order to make the TypeScript type inference
    // work properly, an alias type is set to the
    // userSession variable: (userSession as Session)
    const { userId } = userSession as Session;

    // should return user info
    return { csrfToken, userId };
  },
});
