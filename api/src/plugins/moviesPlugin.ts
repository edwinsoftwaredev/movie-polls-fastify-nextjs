import { FastifyPluginAsync } from 'fastify';
import { movies } from '../services';
import redisClient from './redisClient';

const moviesPlugin: FastifyPluginAsync = async (fastify) => {
  const redisConnectionString = process.env.UPSTASH_REDIS_REST_URL || '';
  const redisConnectionToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

  fastify.register(redisClient, {
    url: redisConnectionString,
    token: redisConnectionToken,
  });
  fastify.register(movies);
};

export default moviesPlugin;
