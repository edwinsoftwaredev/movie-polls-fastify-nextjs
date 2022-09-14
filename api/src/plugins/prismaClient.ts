import { FastifyPluginAsync, FastifyPluginOptions } from "fastify";

interface PrismaClientPluginOptions extends FastifyPluginOptions {}

const prismaClient: FastifyPluginAsync<PrismaClientPluginOptions> = async (
  fastify,
  opts
) => {
  fastify;
  opts;
};

export default prismaClient;
