import createRouter from '../createRouter';

interface GoogleOAuthResponseType {
  credential: string;
}

const googleIDTokenVerification = createRouter().mutation(
  'verifyGoogleIDToken',
  {
    input: (val) => val,
    resolve: async ({ input, ctx }) => {
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
                ...req.session.userSession,
                userId: user.id,
              });

              return req.session
                .save()
                .then(() => res.redirect(`${process.env.WEB_CLIENT_ORIGIN}/`));
            });
        });
    },
  }
);

const googleAuthRouter = createRouter().merge(
  'googleAuth:',
  googleIDTokenVerification
);

export default googleAuthRouter;
