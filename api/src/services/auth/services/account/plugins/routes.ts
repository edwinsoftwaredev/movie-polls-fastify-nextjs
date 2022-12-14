import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyPluginAsync } from 'fastify';
import { createTRPCFastifyContext } from 'trpc/server';
import { accountRouter } from 'trpc/server/routers';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', (req, res, done) => {
    // for Account routes, CSRF protection 
    // is disabled
    if (req.method === 'GET') return done();
    return fastify.csrfProtection(req, res, done);
  });

  fastify.register(fastifyTRPCPlugin, {
    trpcOptions: {
      router: accountRouter,
      createContext: createTRPCFastifyContext(fastify),
    },
  });
};

// NOTE that this plugin encapsulated in the account plugin
// https://www.fastify.io/docs/latest/Reference/Routes/#route-prefixing-and-fastify-plugin
export default routes;
