import { Movie } from 'src/services/public-movies/types';

export const searchMovies = async (
  searchTerm: string,
  language = 'en-US'
): Promise<Array<{ id: number }>> => {
  const TMDB_API_URL = process.env.TMDB_API_URL || '';
  const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

  const urlSearchParams = new URLSearchParams();
  urlSearchParams.set('api_key', TMDB_API_KEY || '');
  urlSearchParams.append('language', language);
  urlSearchParams.append('query', searchTerm);
  urlSearchParams.append('include_adult', 'false');

  // NOTE: it's not a Movie
  const result: { results: Array<Movie> } = (await fetch(
    `${TMDB_API_URL}/search/movie?${urlSearchParams.toString()}`
  ).then((res) => res.json())) as any;

  return result?.results
    ?.filter((movie: any) => !!movie.genre_ids.find((id: number) => id !== 99))
    .map((movie) => ({ id: movie.id }));
};
