import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { auth } from '../services';
import googleOAuth2Client from './google-oauth2-client';
import dynamoDBClient from './dynamodb-client';
import redisClient from './redis-client';

const authPlugin: FastifyPluginAsync = async (fastify) => {
  const redisConnectionString = process.env.UPSTASH_REDIS_REST_URL || '';
  const redisConnectionToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';
  const sessionSecret = process.env.SESSION_SECRET || '';
  const isDevEnv = process.env.NODE_ENV === 'development';
  const accessKeyId = process.env.DYNAMODB_ACCESS_KEY || '';
  const secretAccessKey = process.env.DYNAMODB_SECRET_ACCESS_KEY || '';
  const googleClientID = process.env.GOOGLE_OAUTH2_CLIENT_ID || '';
  const domain = process.env.APP_DOMAIN || '';

  fastify.register(dynamoDBClient, { accessKeyId, secretAccessKey });
  fastify.register(redisClient, {
    url: redisConnectionString,
    token: redisConnectionToken,
  });
  fastify.register(googleOAuth2Client, { clientId: googleClientID });
  fastify.register(auth, { sessionSecret, isDevEnv, domain });
};

export default fastifyPlugin(authPlugin);
