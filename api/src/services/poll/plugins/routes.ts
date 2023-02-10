import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyPluginAsync } from 'fastify';
import csrfRouteGuard from 'src/plugins/csrfRouteGuard';
import userAuthRouteGuard from 'src/plugins/userAuthRouteGuard';
import { createTRPCFastifyContext } from 'trpc/server';
import { pollRouter } from 'trpc/server/routers';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.register(csrfRouteGuard);
  fastify.register(userAuthRouteGuard);

  fastify.register(fastifyTRPCPlugin, {
    trpcOptions: {
      router: pollRouter,
      createContext: createTRPCFastifyContext(fastify),
    },
  });
};

export default routes;
