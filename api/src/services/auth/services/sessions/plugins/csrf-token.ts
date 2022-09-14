import { FastifyPluginAsync } from 'fastify';
import fastifyCsrf from '@fastify/csrf-protection';

const csrfToken: FastifyPluginAsync = async (fastify, opts) => {
  opts;
  fastify.register(fastifyCsrf, {
    cookieOpts: { httpOnly: false, sameSite: true, signed: true },
    sessionPlugin: '@fastify/session',
    cookieKey: '_csrf',
    sessionKey: '_csrf',
  });

  fastify.addHook('onRequest', fastify.csrfProtection);

  // fastify.route({
  //   method: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
  //   url: '/',
  //   onRequest: fastify.csrfProtection,
  //   handler: async (req, res) => {
  //     req;
  //     res;
  //   },
  // });
};

export default csrfToken;
