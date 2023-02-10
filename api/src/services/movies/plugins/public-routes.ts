import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyPluginAsync } from 'fastify';
import csrfRouteGuard from 'src/plugins/csrfRouteGuard';
import { createTRPCFastifyContext } from 'trpc/server';
import { publicMoviesRouter } from 'trpc/server/routers';

const publicRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(csrfRouteGuard);

  // Validates that the request is a GET request and that has been handled by middleware
  fastify.addHook('preHandler', async (req, res) => {
    // TODO: remove headers not need on client side
    const isFromMiddleware = req.headers['x-from-middleware'] === '1';
    if (req.method === 'GET' && isFromMiddleware) return;

    res.code(401);
    res.send();
    return res;
  });

  fastify.register(fastifyTRPCPlugin, {
    trpcOptions: {
      router: publicMoviesRouter,
      createContext: createTRPCFastifyContext(fastify),
    },
  });
};

export default publicRoutes;
