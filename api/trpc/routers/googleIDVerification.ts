import createRouter from 'trpc/createRouter';

interface GoogleOAuthResponseType {
  credential: string;
}

export const googleIDVerification = createRouter().mutation(
  'verifyGoogleIDToken',
  {
    input: (val) => val,
    resolve: async function({ input, ctx }) {
      // const oauthClient = new OAuth2Client(process.env.GOOGLE_OAUTH2_CLIENT_ID);

      const { credential } = input as GoogleOAuthResponseType;
      const { res, session } = ctx;

      return session
        .verifyGoogleIdToken(credential)
        .then((_ticket) => {
          // const payload = ticket.getPayload();
          // const userId = ticket.getUserId();
          // const attributes = ticket.getAttributes();
          // console.log(userId, payload, attributes);
          return res.redirect(`${process.env.WEB_CLIENT_ORIGIN}/`);
        });

    },
  }
);
