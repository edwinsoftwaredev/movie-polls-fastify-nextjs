import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import publicRoutes from './plugins/public-routes';
import {
  homeMoviesVM,
  trendingByGenreVM,
  popularByDecadeAndGenreVM,
} from './decorators/cached-movies';
import { movieDetails } from './decorators/movie-details';
import { movieProviders } from './decorators/movie-providers';
import { movie } from './decorators/movie';

export interface MoviesPluginOptions extends FastifyPluginOptions {}

const movies: FastifyPluginAsync<MoviesPluginOptions> = async (fastify) => {
  fastify.decorate('movies', {
    ...fastify.movies,
    homeMoviesVM: homeMoviesVM(fastify),
    trendingByGenreVM: trendingByGenreVM(fastify),
    popularByDecadeAndGenreVM: popularByDecadeAndGenreVM(fastify),
    movieDetails,
    movieProviders,
    movie,
  });

  fastify.register(publicRoutes, { prefix: '/trpc/publicMoviesRoutes' });
};

export default fastifyPlugin(movies);
