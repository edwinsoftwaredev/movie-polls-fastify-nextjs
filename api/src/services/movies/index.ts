import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { searchMovies } from './decorators';
import routes from './plugins/routes';

const movies: FastifyPluginAsync = async (fastify) => {
  // visit: https://github.com/upstash/ratelimit
  fastify.decorate('movies', {
    ...fastify.movies,
    search: searchMovies(fastify),
  });

  fastify.register(routes, { prefix: '/trpc/moviesRoutes' });
};

export default fastifyPlugin(movies);
