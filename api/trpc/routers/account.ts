import { User } from '@prisma/client';
import createRouter from 'trpc/createRouter';

export const account = createRouter().query('whoiam', {
  resolve: async ({ ctx }) => {
    const { req, res, fastify } = ctx;

    const userId = req.session.userSession.userId;

    if (!userId) return { whoiam: null };

    const whoiam: User | null = await fastify.account.user.getUser(userId);

    return { whoiam };
  },
});
