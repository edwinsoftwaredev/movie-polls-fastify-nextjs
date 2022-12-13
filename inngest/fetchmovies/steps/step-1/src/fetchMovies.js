'use strict';
const { Redis } = require('@upstash/redis/with-fetch');
const https = require('https');
const axios = require('axios');
const dopplerSecrets = require('./doppler-secrets');

const moviesType = {
  TopPopularMovies: 'TopPopularMovies',
  TopTrendingMovies: 'TopTrendingMovies',
  NowPlayingMovies: 'NowPlayingMovies',
  TrendingMoviesByGenre: 'TrendingMoviesByGenre',
};

let genres = undefined;
const fetchedMovies = {};

const fetchGenres = async (tmdbUrl, tmdbKey) => {
  if (genres) return Promise.resolve(genres);

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

const fetchMovieDetails = async (tmdbUrl, tmdbKey, movieId) => {
  if (fetchedMovies[`${movieId}`]) return fetchedMovies[`${movieId}`];

  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('language', 'en-US');
  params.append('append_to_response', 'images');
  params.append('include_image_language', 'en,null');

  const details = await axios
    .get(`${tmdbUrl}/movie/${movieId}?${params.toString()}`)
    .then((res) => res.data)
    .then((data) => {
      // filtering properties.
      const { genres, id } = data;

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

      const result = {
        genres,
        id,
        images: {
          backdrops,
          posters,
        },
      };

      fetchedMovies[`${id}`] = result;

      return result;
    });

  return details;
};

const fetchMoviesDetails = async (tmdbUrl, tmdbKey, movies) =>
  Promise.all(
    movies.map(async (movie) => {
      const {
        adult,
        overview,
        release_date,
        id,
        original_title,
        original_language,
        title,
        vote_average,
      } = movie;
      const details = await fetchMovieDetails(tmdbUrl, tmdbKey, movie.id);
      return {
        adult,
        overview,
        release_date,
        id,
        original_title,
        original_language,
        title,
        vote_average,
        ...details,
      };
    })
  );

const fetchTopPopularMovies = async (tmdbUrl, tmdbKey) => {
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
  params.append('vote_count.gte', 1000);

  const res = await axios
    .get(`${tmdbUrl}/discover/movie?${params.toString()}`)
    .then((res) => res.data)
    .then((res) => fetchMoviesDetails(tmdbUrl, tmdbKey, res.results));

  const movies = res
    .sort((a, b) => b.vote_count - a.vote_count)
    .slice(0, 10)
    .sort((a, b) => b.vote_average - a.vote_average);

  return movies;
};

const fetchTopTrendingMovies = async (tmdbUrl, tmdbKey) => {
  const now = new Date(Date.now());
  const fromDate = new Date(now.setFullYear(now.getFullYear() - 1));

  // Top Trending movies params
  // "Trending": relatively new movies with a vote avg > 7 and votes > 50
  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('language', 'en-US');
  params.append('sort_by', 'primary_release_date.desc');
  params.append('page', 1);
  params.append(
    'primary_release_date.gte',
    fromDate.toISOString().split('T')[0]
  );
  params.append('vote_average.gte', 7);
  params.append('vote_count.gte', 50);

  const res = await axios
    .get(`${tmdbUrl}/discover/movie?${params.toString()}`)
    .then((res) => res.data)
    .then((res) => fetchMoviesDetails(tmdbUrl, tmdbKey, res.results));

  const movies = res
    // .sort((a, b) => new Date(b.release_date) >= new Date(a.release_date) ? 1 : -1)
    .slice(0, 10)
    .sort((a, b) => b.vote_average - a.vote_average);

  return movies;
};

const fetchNowPlayingMovies = async (tmdbUrl, tmdbKey) => {
  // Now Playing movies params
  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('language', 'en-US');
  params.append('sort_by', 'primary_release_date.desc');
  params.append('page', 1);
  params.append(
    'primary_release_date.lte',
    new Date().toISOString().split('T')[0]
  );
  params.append('vote_average.gte', 1);
  params.append('vote_count.gte', 50);

  const movies = await axios
    .get(`${tmdbUrl}/discover/movie?${params.toString()}`)
    .then((res) => res.data)
    .then((res) => fetchMoviesDetails(tmdbUrl, tmdbKey, res.results));

  return movies;
};

const fetchTrendingMoviesByGenre = (tmdbUrl, tmdbKey) => {
  const now = new Date(Date.now());
  const fromDate = new Date(now.setFullYear(now.getFullYear() - 1));

  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('language', 'en-US');
  params.append('sort_by', 'popularity.desc');
  params.append('page', 1);
  params.append(
    'primary_release_date.gte',
    fromDate.toISOString().split('T')[0]
  );
  params.append('vote_average.gte', 1);
  params.append('vote_count.gte', 50);

  return genres
    ?.filter((genre) => genre.name !== 'Documentary')
    .map((genre) => {
      params.set('with_genres', `${genre.id}`);
      return axios
        .get(`${tmdbUrl}/discover/movie?${params.toString()}`)
        .then((res) => res.data)
        .then((res) => fetchMoviesDetails(tmdbUrl, tmdbKey, res.results))
        .then((movies) => {
          // Adds genre name for the currernt genre
          const result = {
            genre_name: genres.find((item) => item.id === genre.id)?.name ?? '',
            results: movies,
          };

          return result;
        })
        .catch((_) => ({}));
    });
};

const fetchPopularMoviesByGenreAndDecade = (tmdbUrl, tmdbKey) => {
  const initDecade = Number.parseInt(`${new Date().getFullYear() / 10}`) * 10;
  let currentDecade = initDecade - 5 * 10;

  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('language', 'en-US');
  params.append('sort_by', 'vote_average.desc');
  params.append('page', 1);
  params.append('vote_count.gte', 500);

  const resultArr = [];

  while (currentDecade <= initDecade) {
    params.set('primary_release_date.gte', `${currentDecade}-01-01`);
    params.set('primary_release_date.lte', `${currentDecade + 9}-12-31`);

    resultArr.push({
      decade: currentDecade,
      moviesByGenrePromise: Promise.allSettled(
        genres
          ?.filter((genre) => genre.name !== 'Documentary')
          .map((genre) => {
            params.set('with_genres', `${genre.id}`);

            return axios
              .get(`${tmdbUrl}/discover/movie?${params.toString()}`)
              .then((res) => res.data)
              .then((res) => fetchMoviesDetails(tmdbUrl, tmdbKey, res.results))
              .then((movies) => {
                // Adds genre name for the currernt genre
                const result = {
                  genre_name:
                    genres.find((item) => item.id === genre.id)?.name ?? '',
                  results: movies,
                };

                return result;
              })
              .catch(() => ({}));
          }) ?? []
      ).then((values) => values.map((res) => res.value ?? {})),
    });

    currentDecade += 10;
  }

  return resultArr;
};

const fetchMovies = async () => {
  const secrets = await dopplerSecrets.getSecrets();

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
      return redis.set(moviesType.TrendingMoviesByGenre, movies);
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
              reason: result.reason,
            },
          })
        )
        .join(', ')
  );

  return status;
};

module.exports = fetchMovies;
