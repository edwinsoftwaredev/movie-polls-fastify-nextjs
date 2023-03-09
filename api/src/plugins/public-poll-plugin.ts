import { FastifyPluginAsync } from 'fastify';
import prismaClient from './prisma-client';
import { publicPoll } from '../services';

const publicPollPlugin: FastifyPluginAsync = async (fastify) => {
  const databaseUrl = process.env.DATABASE_URL || '';

  fastify.register(prismaClient, { databaseUrl });
  fastify.register(publicPoll);
};

export default publicPollPlugin;
