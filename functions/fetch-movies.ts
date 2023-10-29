import { http } from '@google-cloud/functions-framework';
import { serve } from 'inngest/express';
import { Inngest } from 'inngest';
import https from 'https';
import { Redis } from '@upstash/redis';
import axios from 'axios';

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  adult: boolean;
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  vote_count: number;
  vote_average: number;
  release_date: string;
  title: string;
  runtime: number;
  genres: [
    {
      id: number;
      name: string;
    }
  ];
  images: {
    backdrops: [
      {
        width: number;
        height: number;
        file_path: string;
      }
    ];
    posters: [
      {
        width: number;
        height: number;
        file_path: string;
      }
    ];
  };
  credits: {
    cast: Array<{
      name: string;
      adult: boolean;
    }>;
    crew: Array<{
      job: string;
      name: string;
    }>;
  };
}

const getSecrets = async () => {
  const response = await axios.get(`${process.env.DOPPLER_URL}`);
  return response.data;
};

const moviesType = {
  TopPopularMovies: 'TopPopularMovies',
  TopTrendingMovies: 'TopTrendingMovies',
  NowPlayingMovies: 'NowPlayingMovies',
  TrendingMoviesByGenre: 'TrendingMoviesByGenre',
};

let genres: Array<Genre> = [];
const fetchedMovies: Record<
  string,
  Omit<Partial<Movie>, 'images' | 'credits'> & {
    images: {
      backdrops: Array<Movie['images']['backdrops']['0']>;
      posters: Array<Movie['images']['posters']['0']>;
    };
    credits: {
      cast: Array<{ name: string }>;
      crew: Array<{ name: string; job: string }>;
    };
  }
> = {};

const fetchGenres = async (tmdbUrl: string, tmdbKey: string) => {
  if (genres.length) return Promise.resolve(genres);

  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('language', 'en-US');

  return axios
    .get(`${tmdbUrl}/genre/movie/list?${params.toString()}`)
    .then((res) => res.data)
    .then((data) => {
      genres = data.genres;
      return genres;
    });
};

const fetchMovieDetails = async (
  tmdbUrl: string,
  tmdbKey: string,
  movieId: number
) => {
  if (fetchedMovies[`${movieId}`]) return fetchedMovies[`${movieId}`];

  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('language', 'en-US');
  params.append('append_to_response', 'images,credits');
  params.append('include_image_language', 'en,null');

  const details = await axios
    .get<Movie>(`${tmdbUrl}/movie/${movieId}?${params.toString()}`)
    .then((res) => res.data)
    .then((data) => {
      // filtering properties.
      const { genres, id, runtime } = data;

      const backdrops = data.images.backdrops
        .sort((a, b) => b.width - a.width)
        .slice(0, 1)
        .map((backdrop) => ({
          width: backdrop.width,
          file_path: backdrop.file_path,
          height: backdrop.height,
        }));

      const posters = data.images.posters.slice(0, 1).map((backdrop) => ({
        width: backdrop.width,
        file_path: backdrop.file_path,
        height: backdrop.height,
      }));

      const cast = data.credits.cast
        .slice(0, 8)
        .filter((c) => !c.adult)
        .map((c) => ({
          name: c.name,
        }));

      const crew = data.credits.crew
        .filter((c) => c.job === 'Director')
        .map((c) => ({
          job: c.job,
          name: c.name,
        }));

      const result = {
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

      fetchedMovies[`${id}`] = result;

      return result;
    });

  return details;
};

const fetchMoviesDetails = async (
  tmdbUrl: string,
  tmdbKey: string,
  movies: Array<Movie>
) =>
  movies.reduce(
    async (prevPromise, movie: Movie) => {
      const prev = await prevPromise;

      const {
        adult,
        overview,
        release_date,
        id,
        original_title,
        original_language,
        title,
        vote_average,
        vote_count,
      } = movie;

      const details = await fetchMovieDetails(tmdbUrl, tmdbKey, movie.id);

      if (!details.images.backdrops.length || !details.images.posters.length)
        return prev;

      prev.push({
        adult,
        overview,
        release_date,
        id,
        original_title,
        original_language,
        title,
        vote_average,
        vote_count,
        ...details,
      });

      return prev;
    },
    Promise.resolve<
      Array<
        {
          adult: boolean;
          overview: string;
          release_date: string;
          original_title: string;
          original_language: string;
          title: string;
          vote_average: number;
          vote_count: number;
        } & Awaited<ReturnType<typeof fetchMovieDetails>>
      >
    >([])
  );

const fetchTopPopularMovies = async (tmdbUrl: string, tmdbKey: string) => {
  const now = new Date(Date.now());
  const fromDate = new Date(now.setFullYear(now.getFullYear() - 1));

  // Top Popular movies params
  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('language', 'en-US');
  params.append('sort_by', 'vote_average.desc');
  params.append('page', '1');
  params.append(
    'primary_release_date.gte',
    fromDate.toISOString().split('T')[0]
  );
  params.append('vote_average.gte', '7');
  params.append('vote_count.gte', '1000');
  params.append('include_adult', 'false');

  const res = await axios
    .get<{ results: Array<Movie> }>(
      `${tmdbUrl}/discover/movie?${params.toString()}`
    )
    .then((res) => res.data)
    .then((res) => fetchMoviesDetails(tmdbUrl, tmdbKey, res.results));

  const movies = res
    .sort((a, b) => b.vote_count - a.vote_count)
    .slice(0, 10)
    .sort((a, b) => b.vote_average - a.vote_average);

  return movies;
};

const fetchTopTrendingMovies = async (tmdbUrl: string, tmdbKey: string) => {
  const now = new Date(Date.now());
  const fromDate = new Date(now.setFullYear(now.getFullYear() - 1));

  // Top Trending movies params
  // "Trending": relatively new movies with a vote avg > 7 and votes > 50
  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('language', 'en-US');
  params.append('sort_by', 'primary_release_date.desc');
  params.append('page', '1');
  params.append(
    'primary_release_date.gte',
    fromDate.toISOString().split('T')[0]
  );
  params.append('vote_average.gte', '7');
  params.append('vote_count.gte', '50');
  params.append('include_adult', 'false');

  const res = await axios
    .get<{ results: Array<Movie> }>(
      `${tmdbUrl}/discover/movie?${params.toString()}`
    )
    .then((res) => res.data)
    .then((res) => fetchMoviesDetails(tmdbUrl, tmdbKey, res.results));

  const movies = res
    // .sort((a, b) => new Date(b.release_date) >= new Date(a.release_date) ? 1 : -1)
    .slice(0, 10)
    .sort((a, b) => b.vote_average - a.vote_average);

  return movies;
};

const fetchNowPlayingMovies = async (tmdbUrl: string, tmdbKey: string) => {
  // Now Playing movies params
  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('language', 'en-US');
  params.append('sort_by', 'primary_release_date.desc');
  params.append('page', '1');
  params.append(
    'primary_release_date.lte',
    new Date().toISOString().split('T')[0]
  );
  params.append('vote_average.gte', '1');
  params.append('vote_count.gte', '50');
  params.append('include_adult', 'false');

  const movies = await axios
    .get<{ results: Array<Movie> }>(
      `${tmdbUrl}/discover/movie?${params.toString()}`
    )
    .then((res) => res.data)
    .then((res) => fetchMoviesDetails(tmdbUrl, tmdbKey, res.results));

  return movies;
};

const fetchTrendingMoviesByGenre = (tmdbUrl: string, tmdbKey: string) => {
  const now = new Date(Date.now());
  const fromDate = new Date(now.setFullYear(now.getFullYear() - 1));

  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('language', 'en-US');
  params.append('sort_by', 'popularity.desc');
  params.append('page', '1');
  params.append(
    'primary_release_date.gte',
    fromDate.toISOString().split('T')[0]
  );
  params.append('vote_average.gte', '1');
  params.append('vote_count.gte', '50');
  params.append('include_adult', 'false');

  return genres
    ?.filter((genre) => genre.name !== 'Documentary')
    .map(async (genre) => {
      params.set('with_genres', `${genre.id}`);
      try {
        const res = await axios.get<{ results: Array<Movie> }>(
          `${tmdbUrl}/discover/movie?${params.toString()}`
        );
        const res_1 = res.data;
        const movies = await fetchMoviesDetails(
          tmdbUrl,
          tmdbKey,
          res_1.results
        );
        // Adds genre name for the currernt genre
        const result_1 = {
          genre_name: genres.find((item) => item.id === genre.id)?.name ?? '',
          results: movies,
        };
        return result_1;
      } catch (_err) {
        return null;
      }
    }) as Array<
    Promise<{
      genre_name: string;
      results: Awaited<ReturnType<typeof fetchMoviesDetails>>;
    } | null>
  >;
};

const fetchPopularMoviesByGenreAndDecade = (
  tmdbUrl: string,
  tmdbKey: string
) => {
  const initDecade = Number.parseInt(`${new Date().getFullYear() / 10}`) * 10;
  let currentDecade = initDecade - 5 * 10;

  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('language', 'en-US');
  params.append('sort_by', 'vote_average.desc');
  params.append('page', '1');
  params.append('vote_count.gte', '500');
  params.append('include_adult', 'false');

  const resultArr: Array<{
    decade: number;
    moviesByGenrePromise: Promise<Array<any>>;
  }> = [];

  while (currentDecade <= initDecade) {
    params.set('primary_release_date.gte', `${currentDecade}-01-01`);
    params.set('primary_release_date.lte', `${currentDecade + 9}-12-31`);

    resultArr.push({
      decade: currentDecade,
      moviesByGenrePromise: Promise.allSettled(
        genres
          ?.filter((genre) => genre.name !== 'Documentary')
          .map(async (genre) => {
            params.set('with_genres', `${genre.id}`);

            try {
              const res = await axios.get<{ results: Array<Movie> }>(
                `${tmdbUrl}/discover/movie?${params.toString()}`
              );
              const res_1 = res.data;
              const movies = await fetchMoviesDetails(
                tmdbUrl,
                tmdbKey,
                res_1.results
              );
              // Adds genre name for the currernt genre
              const result_1 = {
                genre_name:
                  genres.find((item) => item.id === genre.id)?.name ?? '',
                results: movies,
              };
              return result_1;
            } catch {
              return null;
            }
          }) ?? []
      ).then(
        (
          values: Array<
            PromiseSettledResult<{
              genre_name: string;
              results: Awaited<ReturnType<typeof fetchMoviesDetails>>;
            } | null>
          >
        ) =>
          values.reduce((prev, curr) => {
            if (curr.status === 'fulfilled' && curr.value)
              prev.push(curr.value);
            return prev;
          }, [] as Array<{ genre_name: string; results: Awaited<ReturnType<typeof fetchMoviesDetails>> }>)
      ),
    });

    currentDecade += 10;
  }

  return resultArr;
};

const fetchMovies = async () => {
  const secrets = await getSecrets();

  const {
    UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN,
    TMDB_API_KEY,
    TMDB_API_URL,
  } = secrets;

  const redisConnectionString = UPSTASH_REDIS_REST_URL || '';
  const redisConnectionToken = UPSTASH_REDIS_REST_TOKEN || '';
  const tmdbUrl = TMDB_API_URL;
  const tmdbKey = TMDB_API_KEY;

  const redis = new Redis({
    url: redisConnectionString,
    token: redisConnectionToken,
    agent: new https.Agent({ keepAlive: true }),
  });

  await fetchGenres(tmdbUrl, tmdbKey);

  const p1 = Promise.all(fetchTrendingMoviesByGenre(tmdbUrl, tmdbKey)).then(
    (movies) => {
      return redis.set(
        moviesType.TrendingMoviesByGenre,
        movies.filter((item) => item)
      );
    }
  );

  const p2 = fetchNowPlayingMovies(tmdbUrl, tmdbKey).then((movies) => {
    return redis.set(moviesType.NowPlayingMovies, movies);
  });

  const p3 = fetchTopPopularMovies(tmdbUrl, tmdbKey).then((movies) => {
    return redis.set(moviesType.TopPopularMovies, movies);
  });

  const p4 = fetchTopTrendingMovies(tmdbUrl, tmdbKey).then((movies) => {
    return redis.set(moviesType.TopTrendingMovies, movies);
  });

  const p5 = Promise.all(
    fetchPopularMoviesByGenreAndDecade(tmdbUrl, tmdbKey).map(async (obj) => {
      const moviesByGenre = await obj.moviesByGenrePromise;
      return redis.set(`movies_${obj.decade}`, moviesByGenre);
    })
  );

  const status = await Promise.allSettled([p1, p2, p3, p4, p5]).then(
    (results) =>
      results
        .map((result, index) =>
          JSON.stringify({
            [index]: {
              status: result.status,
              reason: result.status === 'rejected' ? result.reason : undefined,
            },
          })
        )
        .join(', ')
  );

  return status;
};

const inngest = new Inngest({
  id: 'Movie-Polls',
});

http('fetch-movies', async (req, res) => {
  await fetch(process.env.RATE_LIMITER_URL ?? '');

  return serve({
    client: inngest,
    servePath: '/fetch-movies',
    functions: [
      inngest.createFunction(
        { id: 'fetch-movies', name: 'fetch-movies' },
        { cron: '0 12 * * *' },
        async ({}) => {
          return await fetchMovies()
            .then((status) => ({
              status: 200,
              body: `${status}`,
            }))
            .catch((status) => ({
              status: 500,
              body: `${status}`,
            }));
        }
      ),
    ],
  })(req, res);
});
