import { TRPCError } from '@trpc/server';
import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

/**
 * Add user session validation.
 *
 * Returns a 401 response if user is not authenticated.
 * @param fastify
 */
const userAuthRouteGuard: FastifyPluginAsync = async (fastify) => {
  // TODO: update to onRequest
  fastify.addHook('preHandler', async (req, res) => {
    if (req.session.userSession?.userId) return;

    // rejects request
    // https://trpc.io/docs/rpc#error-response
    res.code(401);
    res.send(
      new TRPCError({
        code: 'UNAUTHORIZED',
      })
    );

    return res;
  });
};

export default fastifyPlugin(userAuthRouteGuard);
