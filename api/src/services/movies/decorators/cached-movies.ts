import { Pipeline } from '@upstash/redis/types/pkg/pipeline';
import { Movie, MoviesByGenre } from '../types';

const enum CachedMoviesKeys {
  NowPlayingMovies = 'NowPlayingMovies',
  TopPopularMovies = 'TopPopularMovies',
  TopTrendingMovies = 'TopTrendingMovies',
  TrendingMoviesByGenre = 'TrendingMoviesByGenre',
}

export const nowPlaying = async (redisPipeline: Pipeline) => {
  return redisPipeline.get<Array<Movie>>(CachedMoviesKeys.NowPlayingMovies);
};

export const popular = async (redisPipeline: Pipeline) => {
  return redisPipeline.get<Array<Movie>>(CachedMoviesKeys.TopPopularMovies);
};

export const trending = async (redisPipeline: Pipeline) => {
  return redisPipeline.get<Array<Movie>>(CachedMoviesKeys.TopTrendingMovies);
};

export const trendingByGenre = async (redisPipeline: Pipeline) => {
  return redisPipeline.get<Array<MoviesByGenre>>(
    CachedMoviesKeys.TrendingMoviesByGenre
  );
};

export const popularByDecadeAndGenre = async (
  redisPipeline: Pipeline,
  decade: number
) => {
  return redisPipeline.get<Array<MoviesByGenre>>(`movies_${decade}`);
};
