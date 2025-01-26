import { Movie as MovieType } from '../types';

const imageLanguage: Record<string, string> = {
  'en-US': 'en',
};

export const movie = async (movieId: MovieType['id'], language = 'en-US') => {
  const TMDB_API_URL = process.env.TMDB_API_URL || '';
  const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.set('api_key', TMDB_API_KEY || '');
  urlSearchParams.append('language', language);
  urlSearchParams.append('append_to_response', 'images,credits');
  urlSearchParams.append(
    'include_image_language',
    `${imageLanguage[language]},null`
  );

  const data = await fetch(
    `${TMDB_API_URL}/movie/${movieId}?${urlSearchParams.toString()}`
  );

  const result: MovieType = (await data.json()) as any;

  if (!result || result?.adult) return null;

  const {
    genres,
    id,
    runtime,
    adult,
    overview,
    release_date,
    original_title,
    original_language,
    title,
    vote_average,
  } = result;

  const backdrops = result.images.backdrops
    .sort((a, b) => b.width - a.width)
    .slice(0, 1)
    .map((backdrop) => ({
      width: backdrop.width,
      file_path: backdrop.file_path,
      height: backdrop.height,
    }));

  const posters = result.images.posters.slice(0, 1).map((backdrop) => ({
    width: backdrop.width,
    file_path: backdrop.file_path,
    height: backdrop.height,
  }));

  if (!backdrops.length || !posters.length) return null;

  const cast = result.credits.cast
    .slice(0, 8)
    .filter((c) => !c.adult)
    .map((c) => ({
      name: c.name,
    }));

  const crew = result.credits.crew
    .filter((c) => c.job === 'Director')
    .map((c) => ({
      job: c.job,
      name: c.name,
    }));

  return {
    adult,
    overview,
    release_date,
    original_title,
    original_language,
    title,
    vote_average,
    genres,
    id,
    runtime,
    images: {
      backdrops,
      posters,
    },
    credits: {
      cast,
      crew,
    },
  };
};

export type Movie = typeof movie;
