import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fastifyCsrf from '@fastify/csrf-protection';

const csrfToken: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyCsrf, {
    cookieOpts: { httpOnly: false, sameSite: true, signed: true },
    sessionPlugin: '@fastify/session',
    cookieKey: '_csrf',
    sessionKey: '_csrf',
  });
};

export default fastifyPlugin(csrfToken);
