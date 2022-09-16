import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';

interface PollsPluginOpts extends FastifyPluginOptions {}

const polls: FastifyPluginAsync<PollsPluginOpts> = async (fastify) => {
  fastify.prismaClient;
  fastify.redisClient;
  fastify.register(
    async (instance) => {
      // Protects the entire plugin form CSRF attacks
      instance.addHook('onRequest', fastify.csrfProtection);

      // register routes
      // add decorators
      // add hooks
    },
    { prefix: '/polls' }
  );
};

export default polls;
