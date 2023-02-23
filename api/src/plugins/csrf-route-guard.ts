import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

/**
 * Adds CSRF token validation.
 *
 * Excludes GET requests from validation.
 * @param fastify
 */
const csrfRouteGuard: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', (req, res, done) => {
    if (req.method === 'GET' && req.headers['x-ssr'] === '1') return done();
    if (
      req.url === '/trpc/accountRoutes/account.logout' &&
      req.method === 'POST'
    )
      return done();

    return fastify.csrfProtection(req, res, done);
  });

  // logout
  fastify.addHook('preHandler', (req, res, done) => {
    if (
      req.url === '/trpc/accountRoutes/account.logout' &&
      req.method === 'POST'
    )
      return fastify.csrfProtection(req, res, done);

    return done();
  });
};

export default fastifyPlugin(csrfRouteGuard);
