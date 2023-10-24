import { Pipeline } from '@upstash/redis/types/pkg/pipeline';
import { Movie, MoviesByGenre } from '../types';
import { FastifyInstance } from 'fastify';

const enum CachedMoviesKeys {
  NowPlayingMovies = 'NowPlayingMovies',
  TopPopularMovies = 'TopPopularMovies',
  TopTrendingMovies = 'TopTrendingMovies',
  TrendingMoviesByGenre = 'TrendingMoviesByGenre',
}

export const nowPlaying = (redisPipeline: Pipeline) => {
  return redisPipeline.get<Array<Movie>>(CachedMoviesKeys.NowPlayingMovies);
};

export const popular = (redisPipeline: Pipeline) => {
  return redisPipeline.get<Array<Movie>>(CachedMoviesKeys.TopPopularMovies);
};

export const trending = (redisPipeline: Pipeline) => {
  return redisPipeline.get<Array<Movie>>(CachedMoviesKeys.TopTrendingMovies);
};

export const trendingByGenre = (redisPipeline: Pipeline) => {
  return redisPipeline.get<Array<MoviesByGenre>>(
    CachedMoviesKeys.TrendingMoviesByGenre,
  );
};

export const popularByDecadeAndGenre = (
  redisPipeline: Pipeline,
  decade: number,
) => {
  return redisPipeline.get<Array<MoviesByGenre>>(`movies_${decade}`);
};

export const homeMoviesVM = (fastify: FastifyInstance) => {
  return async () => {
    const p = fastify.redisClient.pipeline();
    nowPlaying(p);
    popular(p);
    trending(p);

    const result = await p.exec<[Array<Movie>, Array<Movie>, Array<Movie>]>();

    return { nowPlaying: result[0], popular: result[1], trending: result[2] };
  };
};

export const trendingByGenreVM = (fastify: FastifyInstance) => {
  return async () => {
    const p = fastify.redisClient.pipeline();
    trendingByGenre(p);

    const result = await p.exec<[Array<MoviesByGenre>]>();

    return { trendingByGenre: result[0] };
  };
};

export const popularByDecadeAndGenreVM = (fastify: FastifyInstance) => {
  return async (decade: number) => {
    const p = fastify.redisClient.pipeline();
    popularByDecadeAndGenre(p, decade);

    const result = await p.exec<[Array<MoviesByGenre>]>();

    return { popularByGenre: result[0] };
  };
};

export type NowPlaying = typeof nowPlaying;
export type Popular = typeof popular;
export type Trending = typeof trending;
export type TrendingByGenre = typeof trendingByGenre;
export type PopularByDecadeAndGenre = typeof popularByDecadeAndGenre;
export type HomeMoviesVM = ReturnType<typeof homeMoviesVM>;
export type TrendingByGenreVM = ReturnType<typeof trendingByGenreVM>;
export type PopularByDecadeAndGenreVM = ReturnType<
  typeof popularByDecadeAndGenreVM
>;
