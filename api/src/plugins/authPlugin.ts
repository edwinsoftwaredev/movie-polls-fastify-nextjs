import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { auth } from '../services';
import googleOAuth2Client from './googleOAuth2Client';
import prismaClient from './prismaClient';
import redisClient from './redisClient';

const authPlugin: FastifyPluginAsync = async (fastify) => {
  const redisConnectionString = process.env.SESSION_CACHE_URL || '';
  const sessionSecret = process.env.SESSION_SECRET || '';
  const isDevEnv = process.env.NODE_ENV === 'development';
  const databaseUrl = process.env.DATABASE_URL || '';
  const googleClientID = process.env.GOOGLE_OAUTH2_CLIENT_ID || '';

  fastify.register(prismaClient, { databaseUrl });
  fastify.register(redisClient, { url: redisConnectionString });
  fastify.register(googleOAuth2Client, { clientId: googleClientID });
  fastify.register(auth, { sessionSecret, isDevEnv });
};

export default fastifyPlugin(authPlugin);
