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
  logout: procedure.mutation(async ({ ctx }) => {
    const { req, res } = ctx;
    return req.session
      .destroy()
      .then(() => res.redirect(`${process.env.WEB_CLIENT_ORIGIN}/`));
  }),
});

export default router({ session: sessionRouter });
