import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { createClient } from 'redis';

interface RedisClientPluginOptions extends FastifyPluginOptions {
  url: string;
}

const redisClient: FastifyPluginAsync<RedisClientPluginOptions> = async (
  fastify,
  opts
) => {
  if (fastify.redisClient) return;
  const { url } = opts;

  const redisClient = createClient({
    url,
  });

  redisClient.on('error', (err) => {
    fastify.log.error(`Redis Client: ${err}`);
  });

  await redisClient.connect();

  fastify.decorate('redisClient', redisClient);
};

export default fastifyPlugin(redisClient);
