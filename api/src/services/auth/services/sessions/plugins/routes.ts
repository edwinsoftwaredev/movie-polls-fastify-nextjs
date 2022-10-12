import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyPluginAsync } from 'fastify';
import { createTRPCFastifyContext } from 'trpc/server';
import { sessionRouter } from 'trpc/server/routers';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyTRPCPlugin, {
    trpcOptions: {
      router: sessionRouter,
      createContext: createTRPCFastifyContext(fastify),
    },
  });
};

// NOTE that this plugin encapsulated in the sessions plugin
// https://www.fastify.io/docs/latest/Reference/Routes/#route-prefixing-and-fastify-plugin
export default routes;
