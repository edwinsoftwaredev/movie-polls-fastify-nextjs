import fastifyPlugin from 'fastify-plugin';
import {
  FastifyPluginAsync,
  FastifyPluginOptions,
  FastifyTypeProvider,
} from 'fastify';
import { OAuth2Client } from 'google-auth-library';

interface GoogleOAuth2ClientType extends FastifyTypeProvider {
  googleOAuth2Client: OAuth2Client;
}

interface GoogleAuthPluginOpts extends FastifyPluginOptions {
  clientId: string;
}

const googleOAuth2Client: FastifyPluginAsync<GoogleAuthPluginOpts> = async (
  fastify,
  opts
) => {
  const { clientId } = opts;
  const oAuth2Client = new OAuth2Client(clientId);

  fastify.decorate('googleOAuth2Client', oAuth2Client);
};

export default fastifyPlugin(googleOAuth2Client);
