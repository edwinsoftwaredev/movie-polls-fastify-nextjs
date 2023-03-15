import { procedure, router } from '../init-tRPC';

const accountRouter = router({
  whoami: procedure.query(async ({ ctx }) => {
    const { req, fastify } = ctx;

    const userId = req.session.userSession?.userId;

    if (!userId) return { whoami: null };

    const whoami = await fastify.account.user.getUser(userId);

    return { whoami };
  }),
  logout: procedure.mutation(async ({ ctx }) => {
    const { req, res } = ctx;
    res.clearCookie('sessionId');
    
    return req.session
      .destroy()
      .then(async () => res.redirect(`${process.env.WEB_CLIENT_ORIGIN}/`));
  }),
});

export default router({ account: accountRouter });
