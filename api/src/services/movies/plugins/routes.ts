import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyPluginAsync } from 'fastify';
import { createTRPCFastifyContext } from 'trpc/server';
import { moviesRouter } from 'trpc/server/routers';

const routes: FastifyPluginAsync = async (fastify) => {
  // Protects the entire plugin from CSRF attacks
  fastify.addHook('onRequest', (req, res, done) => {
    if (req.method === 'GET' && req.headers['x-ssr'] === '1') return done();

    return fastify.csrfProtection(req, res, done);
  });

  // TODO: Refactor
  // Validates that user is authenticated
  fastify.addHook('preHandler', async (req, res) => {
    if (req.session.userSession?.userId) return;

    // rejects request
    res.code(401);
    res.send();
    return res;
  });

  fastify.register(fastifyTRPCPlugin, {
    trpcOptions: {
      router: moviesRouter,
      createContext: createTRPCFastifyContext(fastify),
    },
  });
};

export default routes;
