import { FastifyPluginAsync } from 'fastify';
import { createTRPCFastifyContext } from 'trpc/server';
import userAuthRouteGuard from '../../../../../plugins/user-auth-route-guard';
import csrfRouteGuard from '../../../../../plugins/csrf-route-guard';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { privateAccountRouter } from 'trpc/server/routers';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.register(csrfRouteGuard);
  fastify.register(userAuthRouteGuard);

  fastify.register(fastifyTRPCPlugin, {
    trpcOptions: {
      router: privateAccountRouter,
      createContext: createTRPCFastifyContext(fastify),
    },
  });
};

export default routes;
