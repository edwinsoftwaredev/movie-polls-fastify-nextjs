import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import cachedMovies from './plugins/cached-movies';
import routes from './plugins/routes';
import fastifyPlugin from 'fastify-plugin';
import publicRoutes from './plugins/public-routes';

export interface MoviesPluginOptions extends FastifyPluginOptions {}

const movies: FastifyPluginAsync<MoviesPluginOptions> = async (fastify) => {
  fastify.register(cachedMovies);
  fastify.register(routes, { prefix: '/trpc/moviesRoutes' });
  fastify.register(publicRoutes, { prefix : '/trpc/publicMoviesRoutes' });
};

export default fastifyPlugin(movies);

