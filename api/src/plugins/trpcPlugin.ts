import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {
  fastifyTRPCPlugin,
} from '@trpc/server/adapters/fastify';
import appRouter from 'trpc/server';
import { createTRPCFastifyContext } from 'trpc/context';

const trpcPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext: createTRPCFastifyContext(fastify),
    },
  });
};

export default fastifyPlugin(trpcPlugin);
