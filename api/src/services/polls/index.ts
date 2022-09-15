import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';

interface PollsPluginOpts extends FastifyPluginOptions {}

const polls: FastifyPluginAsync<PollsPluginOpts> = async (fastify, opts) => {
  fastify.prismaClient;
  fastify.redisClient;
  fastify.register(
    async () => {
      // register routes
      // add decorators
      // add hooks
    },
    { prefix: '/polls' }
  );
};

export default polls;
