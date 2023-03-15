import { router, procedure } from '../init-tRPC';

const privateAccountRouter = router({
  delete: procedure.mutation(async ({ ctx }) => {
    const { fastify, req, res } = ctx;
    const userSession = req.session.userSession!;

    await fastify.account.user.deleteAccount(userSession);
    await req.session.destroy();

    const isDevEnv = process.env.NODE_ENV === 'development';
    const domain = process.env.APP_DOMAIN || '';
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: !isDevEnv,
      sameSite: 'strict',
      domain,
    });

    return;
  }),
});

export default router({ privateAccount: privateAccountRouter });
