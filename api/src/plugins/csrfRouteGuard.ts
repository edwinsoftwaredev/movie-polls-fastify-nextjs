import { FastifyPluginAsync } from 'fastify';

/**
 * Adds CSRF token validation.
 *
 * Excludes GET requests from validation.
 * @param fastify
 */
const csrfRouteGuard: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', (req, res, done) => {
    if (req.method === 'GET' && req.headers['x-ssr'] === '1') return done();

    return fastify.csrfProtection(req, res, done);
  });
};

export default csrfRouteGuard;
