import { FastifyPluginAsync } from 'fastify';
import { publicMovies } from '../services';
import redisClient from './redis-client';

const publicMoviesPlugin: FastifyPluginAsync = async (fastify) => {
  const redisConnectionString = process.env.UPSTASH_REDIS_REST_URL || '';
  const redisConnectionToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

  fastify.register(redisClient, {
    url: redisConnectionString,
    token: redisConnectionToken,
  });
  fastify.register(publicMovies);
};

export default publicMoviesPlugin;
