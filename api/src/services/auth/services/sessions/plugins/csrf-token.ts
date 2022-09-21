import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fastifyCsrf from '@fastify/csrf-protection';
import session from './session';

const csrfToken: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyCsrf, {
    sessionPlugin: '@fastify/session',
  });

  fastify.get('/', async (req, res) => {
    const sessionCSRFToken = await res.generateCsrf();
    return { sessionCSRFToken };
  });
};

export default fastifyPlugin(csrfToken);
