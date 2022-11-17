import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { FastifyPluginAsync } from "fastify";
import { createTRPCFastifyContext } from "trpc/server";
import { moviesRouter } from "trpc/server/routers";

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyTRPCPlugin, {
    trpcOptions: {
      router: moviesRouter,
      createContext: createTRPCFastifyContext(fastify),
    },
  })
}

export default routes;
