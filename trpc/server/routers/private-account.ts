import { router, procedure } from '../init-tRPC';

const privateAccountRouter = router({
  delete: procedure.mutation(async ({ ctx }) => {
    const { fastify, req, res } = ctx;
    const userSession = req.session.userSession!;

    await fastify.account.user.deleteAccount(userSession);
    await req.session.destroy();
    res.clearCookie('sessionId');

    return;
  }),
});

export default router({ privateAccount: privateAccountRouter });
