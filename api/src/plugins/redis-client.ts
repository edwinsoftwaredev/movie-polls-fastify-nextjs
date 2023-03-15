import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Redis } from '@upstash/redis/with-fetch';
import https from 'https';

interface RedisClientPluginOptions extends FastifyPluginOptions {
  url: string;
  token: string; // should be optional
}

const redisClient: FastifyPluginAsync<RedisClientPluginOptions> = async (
  fastify,
  opts
) => {
  if (fastify.redisClient) return;
  const { url, token } = opts;

  fastify.log.info('Configuring Redis client...');

  const redisClient = new Redis({
    token,
    url,
    agent: new https.Agent({ keepAlive: true }),
  });

  fastify.log.info('Redis client configured.');

  fastify.decorate('redisClient', redisClient);
};

export default fastifyPlugin(redisClient);
