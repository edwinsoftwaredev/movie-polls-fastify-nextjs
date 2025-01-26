import { MovieDetail } from '../types';

export const movieDetails = async (
  movieId: number
): Promise<MovieDetail | null> => {
  const TMDB_API_URL = process.env.TMDB_API_URL || '';
  const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

  const urlSearchParams = new URLSearchParams();
  urlSearchParams.set('api_key', TMDB_API_KEY || '');
  urlSearchParams.set('append_to_response', 'release_dates');

  // TODO: Get session's geolocation
  urlSearchParams.set('language', 'en-US');
  urlSearchParams.set('include_image_language', 'en,null');
  const result = await fetch(
    `${TMDB_API_URL}/movie/${movieId}?${urlSearchParams.toString()}`
  );

  const movieDetails = (await result.json()) as any;

  if (!movieDetails || movieDetails?.adult) return null;

  const { release_dates, iso_3166_1 } =
    movieDetails.release_dates.results?.find(
      (r: any) =>
        r.iso_3166_1 === 'US' &&
        r.release_dates?.find((rd: any) => rd.certification)
    ) || {};

  const { certification, release_date } =
    release_dates?.find((r: any) => r.certification) || {};

  return {
    homepage: '',
    release_date,
    certification,
    iso_3166_1,
  };
};

export type MovieDetails = typeof movieDetails;
