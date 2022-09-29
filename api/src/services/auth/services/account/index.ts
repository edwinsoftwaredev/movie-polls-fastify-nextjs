import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import passportGoogleOauth20 from './plugins/passport-google-oauth20';

const account: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(passportGoogleOauth20, {
    clientID: `${process.env.GOOGLE_OAUTH2_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_OAUTH2_CLIENT_SECRET}`,
    callbackURL: `${process.env.HOST_URL}/auth/google/callback` || '',
  });
};

export default fastifyPlugin(account);
