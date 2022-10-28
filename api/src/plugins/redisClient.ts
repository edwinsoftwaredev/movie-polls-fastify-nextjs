import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Redis } from '@upstash/redis';
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

  console.log(`Has URL: ${!!url}`, `Has token: ${!!token}`);

  const redisClient = new Redis({
    token,
    url,
    agent: new https.Agent({ keepAlive: true })
  });

  fastify.decorate('redisClient', redisClient);
};

export default fastifyPlugin(redisClient);
