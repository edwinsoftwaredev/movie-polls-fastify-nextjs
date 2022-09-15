import { FastifyPluginAsync } from 'fastify';

import { FastifyPluginOptions } from 'fastify';

export interface MoviesPluginOptions extends FastifyPluginOptions {}

const movies: FastifyPluginAsync<MoviesPluginOptions> = async (
  fastify,
  opts
) => {
  fastify.redisClient;
  fastify.prismaClient;
  fastify.register(
    async () => {
      // register routes
      // add decorators
      // add hooks
    },
    { prefix: '/movies' }
  );
};

export default movies;
