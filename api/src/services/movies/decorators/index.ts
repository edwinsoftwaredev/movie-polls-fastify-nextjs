import { FastifyInstance } from 'fastify';
import { Movie } from '../../../../src/services/public-movies/types';
import { UserSession } from 'app-types';

export const searchMovies =
  (fastify: FastifyInstance) =>
  async (
    userSession: UserSession,
    searchTerm: string,
    language = 'en-US'
  ): Promise<Array<{ id: number }>> => {
    const p = fastify.redisClient.pipeline();
    p.incr(`search-count-${userSession.userId}`);
    p.expire(`search-count-${userSession.userId}`, 3600 * 24);

    const pResult = await p.exec<[number, number]>();
    const { '0': searchCount } = pResult;

    if (searchCount >= 25) throw new Error('LIMIT_REACHED');

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
      ?.filter(
        (movie: any) => !!movie.genre_ids.find((id: number) => id !== 99)
      )
      .map((movie) => ({ id: movie.id }));
  };

export type SearchMovies = ReturnType<typeof searchMovies>;
