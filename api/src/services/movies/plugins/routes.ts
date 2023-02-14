import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyPluginAsync } from 'fastify';
import csrfRouteGuard from '../../../plugins/csrfRouteGuard';
import userAuthRouteGuard from '../../../plugins/userAuthRouteGuard';
import { createTRPCFastifyContext } from 'trpc/server';
import { moviesRouter } from 'trpc/server/routers';

const routes: FastifyPluginAsync = async (fastify) => {
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
