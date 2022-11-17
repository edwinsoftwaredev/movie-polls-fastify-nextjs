import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Movie, MoviesByGenre } from '../types';

const enum CachedMoviesKeys {
  NowPlayingMovies = 'NowPlayingMovies',
  TopPopularMovies = 'TopPopularMovies',
  TopTrendingMovies = 'TopTrendingMovies',
  TrendingMoviesByGenre = 'TrendingMoviesByGenre',
}

const cachedMovies: FastifyPluginAsync = async (fastify) => {
  const nowPlaying = async () => {
    return fastify.redisClient.get<Array<Movie>>(CachedMoviesKeys.NowPlayingMovies);
  }

  const popular = async () => {
    return fastify.redisClient.get<Array<Movie>>(CachedMoviesKeys.TopPopularMovies);
  }

  const trending = async () => {
    return fastify.redisClient.get<Array<Movie>>(CachedMoviesKeys.TopTrendingMovies);
  }

  const trendingByGenre = async () => {
    return fastify.redisClient.get<Array<MoviesByGenre>>(CachedMoviesKeys.TrendingMoviesByGenre);
  }

  fastify.decorate('movies', {
    ...fastify.movies,
    nowPlaying,
    popular,
    trending,
    trendingByGenre
  });
}

export default fastifyPlugin(cachedMovies);
