import { Pipeline } from '@upstash/redis/types/pkg/pipeline';
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
  const nowPlaying = async (redisPipeline?: Pipeline) => {
    return (redisPipeline ?? fastify.redisClient).get<Array<Movie>>(CachedMoviesKeys.NowPlayingMovies);
  }

  const popular = async (redisPipeline?: Pipeline) => {
    return (redisPipeline ?? fastify.redisClient).get<Array<Movie>>(CachedMoviesKeys.TopPopularMovies);
  }

  const trending = async (redisPipeline?: Pipeline) => {
    return (redisPipeline ?? fastify.redisClient).get<Array<Movie>>(CachedMoviesKeys.TopTrendingMovies);
  }

  const trendingByGenre = async (redisPipeline?: Pipeline) => {
    return (redisPipeline ?? fastify.redisClient).get<Array<MoviesByGenre>>(CachedMoviesKeys.TrendingMoviesByGenre);
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
