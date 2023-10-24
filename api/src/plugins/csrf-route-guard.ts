import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

const isLogout = (req: FastifyRequest) =>
  req.url === '/trpc/accountRoutes/account.logout' && req.method === 'POST';

/**
 * Adds CSRF token validation.
 *
 * Excludes GET requests from validation.
 * @param fastify
 */
const csrfRouteGuard: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', (req, res, done) => {
    if (req.method === 'GET' && req.headers['x-ssr'] === '1') return done();

    if (isLogout(req)) return done();

    fastify.csrfProtection(req, res, done);
  });

  // logout
  fastify.addHook('preHandler', (req, res, done) => {
    if (!isLogout(req)) return done();

    fastify.csrfProtection(req, res, done);
  });
};

export default fastifyPlugin(csrfRouteGuard);
