import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { searchMovies } from './decorators/search-movies';
import routes from './plugins/routes';

const movies: FastifyPluginAsync = async (fastify) => {
  // TODO: rate limit by userId
  fastify.decorate('movies', {
    search: searchMovies,
  });

  fastify.register(routes, { prefix: '/trpc/moviesRoutes' });
};

export default fastifyPlugin(movies);
