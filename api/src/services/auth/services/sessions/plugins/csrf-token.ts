import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fastifyCsrf from '@fastify/csrf-protection';

const csrfToken: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyCsrf, {
    sessionPlugin: '@fastify/session',
  });
};

export default fastifyPlugin(csrfToken);
