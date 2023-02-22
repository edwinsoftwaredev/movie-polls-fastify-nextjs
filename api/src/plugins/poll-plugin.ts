import { FastifyPluginAsync } from 'fastify';
import prismaClient from './prisma-client';
import { poll } from '../services';

const pollPlugin: FastifyPluginAsync = async (fastify) => {
  const databaseUrl = process.env.DATABASE_URL || '';

  fastify.register(prismaClient, { databaseUrl });
  fastify.register(poll);
};

export default pollPlugin;
