import { MovieProviders as MovieProvidersType } from '../types';

export const movieProviders = async (
  movieId: number
): Promise<MovieProvidersType> => {
  const TMDB_API_URL = process.env.TMDB_API_URL || '';
  const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

  const urlSearchParams = new URLSearchParams();
  urlSearchParams.set('api_key', TMDB_API_KEY || '');

  // TODO: Get session's geolocation
  urlSearchParams.set('language', 'en-US');
  const result = await fetch(
    `${TMDB_API_URL}/movie/${movieId}/watch/providers?${urlSearchParams.toString()}`
  );

  const data = (await result.json()) as any;
  const providers = data.results['US'] || {};

  return {
    link: providers.link,
    flatrate: providers['flatrate'] ?? [],
    rent: providers['rent'] ?? [],
    buy: providers['buy'] ?? [],
  };
};

export type MovieProviders = typeof movieProviders;
