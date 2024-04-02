import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyPluginAsync } from 'fastify';
import { createTRPCFastifyContext } from 'trpc/server';
import { publicMoviesRouter } from 'trpc/server/routers';

const publicRoutes: FastifyPluginAsync = async (fastify) => {
  // Validates that the request is a GET request and that has been handled by middleware
  fastify.addHook('preHandler', async (req, res) => {
    // TODO: remove headers not need on client side
    const isFromMiddleware = req.headers['x-from-middleware'] === '1';
    if (req.method === 'GET' && isFromMiddleware) return;
    if (process.env.NODE_ENV === 'development') return;

    res.code(401);
    res.send();
    return res;
  });

  fastify.addHook('onSend', async (_req, res) => {
    // edge network configs
    res.header('Access-Control-Max-Age', 300);

    res.header(
      'Cache-Control',
      `s-maxage=${
        3600 * 24
      }, stale-while-revalidate=${3600}, max-age=${3600}, public`
    );
  });

  fastify.register(fastifyTRPCPlugin, {
    trpcOptions: {
      router: publicMoviesRouter,
      createContext: createTRPCFastifyContext(fastify),
    },
  });
};

export default publicRoutes;
