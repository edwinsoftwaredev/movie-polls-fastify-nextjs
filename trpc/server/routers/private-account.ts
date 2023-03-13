import { router, procedure } from '../init-tRPC';

const privateAccountRouter = router({
  delete: procedure.mutation(async ({ ctx }) => {
    const { fastify, req } = ctx;
    const userSession = req.session.userSession!;
    return fastify.account.user.deleteAccount(userSession);
  }),
});

export default router({ privateAccount: privateAccountRouter });
