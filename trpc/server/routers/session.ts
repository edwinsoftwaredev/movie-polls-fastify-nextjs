import { router, procedure } from '../init-tRPC';

const sessionRouter = router({
  getSession: procedure.query(async ({ ctx }) => {
    const {
      req: { session },
      res,
      fastify,
    } = ctx;

    fastify.log.info('Routing session...');

    const csrfToken: string = await res.generateCsrf();

    const { userSession } = session;
    const { userId } = userSession || {};

    return { csrfToken, isAuthenticated: !!userId };
  }),
});

export default router({ session: sessionRouter });
