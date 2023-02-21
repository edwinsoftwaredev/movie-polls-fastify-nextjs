import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import routes from './plugins/routes';
import fastifyPlugin from 'fastify-plugin';
import publicRoutes from './plugins/public-routes';
import {
  nowPlaying,
  popular,
  popularByDecadeAndGenre,
  trending,
  trendingByGenre,
} from './decorators/cached-movies';
import { movieDetails } from './decorators/movie-details';
import { movieProviders } from './decorators/movie-providers';
import { movie } from './decorators/movie';

export interface MoviesPluginOptions extends FastifyPluginOptions {}

const movies: FastifyPluginAsync<MoviesPluginOptions> = async (fastify) => {
  fastify.decorate('movies', {
    nowPlaying,
    popular,
    trending,
    trendingByGenre,
    popularByDecadeAndGenre,
    movieDetails,
    movieProviders,
    movie,
  });

  fastify.register(routes, { prefix: '/trpc/moviesRoutes' });
  fastify.register(publicRoutes, { prefix: '/trpc/publicMoviesRoutes' });
};

export default fastifyPlugin(movies);
