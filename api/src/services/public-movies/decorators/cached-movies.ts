import { Movie, MoviesByGenre } from '../types';
import { FastifyInstance } from 'fastify';

const enum CachedMoviesKeys {
  NowPlayingMovies = 'NowPlayingMovies',
  TopPopularMovies = 'TopPopularMovies',
  TopTrendingMovies = 'TopTrendingMovies',
  TrendingMoviesByGenre = 'TrendingMoviesByGenre',
}

export const homeMoviesVM = (fastify: FastifyInstance) => {
  return async () => {
    const p = fastify.redisClient.pipeline();
    p.get<Array<Movie>>(CachedMoviesKeys.NowPlayingMovies);
    p.get<Array<Movie>>(CachedMoviesKeys.TopPopularMovies);
    p.get<Array<Movie>>(CachedMoviesKeys.TopTrendingMovies);

    const result = await p.exec<[Array<Movie>, Array<Movie>, Array<Movie>]>();

    return { nowPlaying: result[0], popular: result[1], trending: result[2] };
  };
};

export const trendingByGenreVM = (fastify: FastifyInstance) => {
  return async () => {
    const p = fastify.redisClient.pipeline();
    p.get<Array<MoviesByGenre>>(CachedMoviesKeys.TrendingMoviesByGenre);

    const result = await p.exec<[Array<MoviesByGenre>]>();

    return { trendingByGenre: result[0] };
  };
};

export const popularByDecadeAndGenreVM = (fastify: FastifyInstance) => {
  return async (decade: number) => {
    const p = fastify.redisClient.pipeline();
    p.get<Array<MoviesByGenre>>(`movies_${decade}`);

    const result = await p.exec<[Array<MoviesByGenre>]>();

    return { popularByGenre: result[0] };
  };
};

export type HomeMoviesVM = ReturnType<typeof homeMoviesVM>;
export type TrendingByGenreVM = ReturnType<typeof trendingByGenreVM>;
export type PopularByDecadeAndGenreVM = ReturnType<
  typeof popularByDecadeAndGenreVM
>;
