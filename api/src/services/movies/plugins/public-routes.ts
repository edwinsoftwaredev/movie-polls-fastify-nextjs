import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyPluginAsync } from 'fastify';
import { createTRPCFastifyContext } from 'trpc/server';
import { publicMoviesRouter } from 'trpc/server/routers';

const publicRoutes: FastifyPluginAsync = async (fastify) => {
  // Protects the entire plugin from CSRF attacks
  fastify.addHook('onRequest', (req, res, done) => {
    if (req.method === 'GET' && req.headers['x-ssr'] === '1') return done();

    return fastify.csrfProtection(req, res, done);
  });

  // Validates that the request is a GET request and that it includes the MOVIES_API_KEY
  fastify.addHook('preHandler', async (req, res) => {
    const reqKey = req.headers['x-api-key-movies'];
    if (
      req.method === 'GET' &&
      reqKey === process.env.MOVIES_API_KEY &&
      req.headers['x-ssr'] === '1'
    )
      return;

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
