import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyPluginAsync } from 'fastify';
import csrfRouteGuard from '../../../plugins/csrf-route-guard';
import userAuthRouteGuard from '../../../plugins/user-auth-route-guard';
import { createTRPCFastifyContext } from 'trpc/server';
import { pollRouter } from 'trpc/server/routers';
import { trcpErrorHandler } from 'trpc/server/context';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onSend', async (_req, res) => {
    res.header('Access-Control-Max-Age', 300);
  });

  fastify.register(csrfRouteGuard);
  fastify.register(userAuthRouteGuard);

  fastify.register(fastifyTRPCPlugin, {
    trpcOptions: {
      router: pollRouter,
      createContext: createTRPCFastifyContext(fastify),
      onError: trcpErrorHandler,
    },
  });
};

export default routes;
