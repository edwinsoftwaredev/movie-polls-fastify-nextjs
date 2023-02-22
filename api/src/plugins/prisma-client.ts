import fastifyPlugin from 'fastify-plugin';
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import { PrismaClient } from '@prisma/client';

interface PrismaClientPluginOptions extends FastifyPluginOptions {
  databaseUrl: string;
}

const prismaClient: FastifyPluginAsync<PrismaClientPluginOptions> = async (
  fastify,
  opts
) => {
  const { databaseUrl: url } = opts;

  fastify.log.info('Configuring Prisma client...');
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url
      },
    },
  });

  fastify.log.info('Prisma client configured.')
  fastify.decorate('prismaClient', prisma);
};

export default fastifyPlugin(prismaClient);
