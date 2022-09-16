import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';

export interface MoviesPluginOptions extends FastifyPluginOptions {}

const movies: FastifyPluginAsync<MoviesPluginOptions> = async (fastify) => {
  fastify.redisClient;
  fastify.prismaClient;

  fastify.register(
    async (instance) => {
      // Protects the entire plugin from CSRF attacks
      instance.addHook('onRequest', instance.csrfProtection);

      // add decorators
      // add hooks
      // add routes
    },
    { prefix: '/movies' }
  );
};

export default movies;
