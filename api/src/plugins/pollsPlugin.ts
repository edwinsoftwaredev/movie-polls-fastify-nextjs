import { FastifyPluginAsync } from 'fastify';
import prismaClient from './prismaClient';
import { polls } from 'services';

const pollsPlugin: FastifyPluginAsync = async (fastify) => {
  const databaseUrl = process.env.DATABASE_URL || '';

  fastify.register(prismaClient, { databaseUrl });
  fastify.register(polls);
};

export default pollsPlugin;
