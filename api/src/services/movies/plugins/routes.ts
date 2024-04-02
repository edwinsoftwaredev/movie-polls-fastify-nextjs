import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyPluginAsync } from 'fastify';
import csrfRouteGuard from '../../../plugins/csrf-route-guard';
import userAuthRouteGuard from '../../../plugins/user-auth-route-guard';
import { createTRPCFastifyContext } from 'trpc/server';
import { moviesRouter } from 'trpc/server/routers';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onSend', async (_req, res) => {
    res.header('Access-Control-Max-Age', 300);
  });

  fastify.register(csrfRouteGuard);
  fastify.register(userAuthRouteGuard);

  fastify.register(fastifyTRPCPlugin, {
    trpcOptions: {
      router: moviesRouter,
      createContext: createTRPCFastifyContext(fastify),
    },
  });
};

export default routes;
