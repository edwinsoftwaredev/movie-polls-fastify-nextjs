import { Pipeline } from '@upstash/redis/types/pkg/pipeline';
import { Movie, MoviesByGenre } from '../types';

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
    CachedMoviesKeys.TrendingMoviesByGenre
  );
};

export const popularByDecadeAndGenre = (
  redisPipeline: Pipeline,
  decade: number
) => {
  return redisPipeline.get<Array<MoviesByGenre>>(`movies_${decade}`);
};

export type NowPlaying = typeof nowPlaying;
export type Popular = typeof popular;
export type Trending = typeof trending;
export type TrendingByGenre = typeof trendingByGenre;
export type PopularByDecadeAndGenre = typeof popularByDecadeAndGenre;
