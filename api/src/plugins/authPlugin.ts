import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { auth } from 'services';
import prismaClient from './prismaClient';
import redisClient from './redisClient';

const authPlugin: FastifyPluginAsync = async (fastify) => {
  const redisConnectionString = process.env.SESSION_CACHE_URL || '';
  const sessionSecret = process.env.SESSION_SECRET || '';
  const isDevEnv = process.env.ENV === 'development';
  const databaseUrl = process.env.DATABASE_URL || '';

  fastify.register(prismaClient, { databaseUrl });
  fastify.register(redisClient, { url: redisConnectionString });
  fastify.register(auth, { sessionSecret, isDevEnv });
};

export default fastifyPlugin(authPlugin);
