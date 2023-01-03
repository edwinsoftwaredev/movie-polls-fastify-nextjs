import { fetch } from 'undici';
import { MovieDetail } from '../types';

export const movieDetails = async (movieId: number) => {
  const TMDB_API_URL = process.env.TMDB_API_URL || '';
  const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

  const urlSearchParams = new URLSearchParams();
  urlSearchParams.set('api_key', TMDB_API_KEY || '');
  urlSearchParams.set('append_to_response', 'release_dates');

  // TODO: Get session's geolocation
  urlSearchParams.set('language', 'en-US');
  urlSearchParams.set('include_image_language', 'en,null');
  const result = await fetch(`${TMDB_API_URL}/movie/${movieId}`, {
    body: urlSearchParams,
  });

  const movieDetails: MovieDetail = (await result.json()) as any;

  return {
    ...movieDetails,
    release_dates: {
      results: movieDetails.release_dates.results.filter(
        (r) => r.iso_3166_1 === 'US'
      ),
    },
  };
};
