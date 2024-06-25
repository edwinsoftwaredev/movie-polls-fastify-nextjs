import { procedure, router } from '../init-tRPC';

interface GoogleOAuthResponseType {
  credential: string;
}

const googleAuthRouter = router({
  verifyGoogleIDToken: procedure
    .input((val) => val)
    .mutation(async ({ input, ctx }) => {
      const { req, res, fastify } = ctx;

      const { credential } = input as GoogleOAuthResponseType;

      return req.session
        .verifyGoogleIdToken(credential)
        .then(async (ticket) => {
          const {
            email,
            email_verified: emailVerified,
            name: displayName,
            picture,
          } = ticket.getPayload() || {};
          const googleUserId = ticket.getUserId();
          const userId = `gg-${googleUserId}`;
          const provider = 'Google';

          return fastify.prismaClient.user
            .upsert({
              where: {
                id: userId,
              },
              update: {
                displayName,
                email,
                emailVerified,
                picture,
                provider,
              },
              create: {
                id: userId,
                displayName: displayName || 'Anonymous',
                provider,
                email,
                emailVerified,
                picture,
              },
            })
            .then(async (user) => {
              req.session.set('userSession', {
                id: req.session.userSession?.id ?? '',
                csrfSecret: req.session.userSession?.csrfSecret ?? '',
                expiresOn: req.session.userSession?.expiresOn ?? null,
                userId: user.id,
              });

              return req.session
                .save()
                .then(() => res.redirect(`${process.env.WEB_CLIENT_ORIGIN}/`));
            });
        });
    }),
});

export default router({ googleAuth: googleAuthRouter });
