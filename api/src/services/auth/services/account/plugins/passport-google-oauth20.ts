import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

interface PassportGoogleOauth20PluginOptions extends FastifyPluginOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

const passportGoogleOauth20: FastifyPluginAsync<
  PassportGoogleOauth20PluginOptions
> = async (fastify, opts) => {
  const { clientID, clientSecret, callbackURL } = opts;

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      (accessToken, refreshToken, profile, done) => {
        accessToken;
        refreshToken;
        const { id, name, photos, emails, provider } = profile;

        console.log(photos);

        const email = emails?.shift()?.value;
        const displayName = name?.givenName || 'anonymous';

        fastify.prismaClient.user
          .upsert({
            where: {
              id,
            },
            update: {
              email,
              provider,
              displayName,
            },
            create: {
              id,
              displayName,
              email,
              provider,
            },
          })
          .then((user) => {
            done(undefined, user);
          })
          .catch((reason) => {
            done(reason);
          });
      }
    )
  );

  fastify.get('/auth/google', async (req, res) => {
    passport.authenticate('google', { scope: ['profile'] });
  });

  fastify.get('/auth/google/callback', async (req, res) => {
    passport.authenticate(
      'google',
      {
        failureRedirect: `${process.env.WEB_CLIENT_ORIGIN}/login`,
        failWithError: true,
      },
      (args) => {
        console.log(args);
        // Successful authentication, redirect home.
        res.redirect(301, `${process.env.WEB_CLIENT_ORIGIN}/`);
      }
    );
  });
};

export default fastifyPlugin(passportGoogleOauth20);
