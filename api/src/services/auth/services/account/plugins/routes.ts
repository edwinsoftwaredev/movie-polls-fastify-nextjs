import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyPluginAsync } from 'fastify';
import csrfRouteGuard from '../../../../../plugins/csrf-route-guard';
import { createTRPCFastifyContext } from 'trpc/server';
import { accountRouter } from 'trpc/server/routers';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onSend', async (_req, res) => {
    res.header('Access-Control-Max-Age', 300);
  });

  fastify.register(csrfRouteGuard);

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
