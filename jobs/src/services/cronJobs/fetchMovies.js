'use strict';
const { createScheduledFunction } = require('inngest');
const { Redis } = require('@upstash/redis');
const https = require('https');
const axios = require('axios');

const moviesType = {
  TopPopularMovies: 'TopPopularMovies',
  TopTrendingMovies: 'TopTrendingMovies',
  NowPlayingMovies: 'NowPlayingMovies',
  TrendingMoviesByGenre: 'TrendingMoviesByGenre',
};

const tmdbKey = `${process.env.TMDB_API_KEY}`;
const tmdbUrl = `${process.env.TMDB_API_URL}`;

let genres = undefined;

const fetchGenres = async () => {
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

const fetchTopPopularMovies = async () => {
  const now = new Date(Date.now());
  const fromDate = new Date(now.setFullYear(now.getFullYear() - 1));

  // Top Popular movies params
  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
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
    .then((res) => res.data);

  const movies = res.results
    .map((movie) => ({
      ...movie,
      genre_names: movie.genre_ids.map(
        (id) => genres?.find((item) => item.id === id)?.name ?? ''
      ),
    }))
    .sort((a, b) => b.vote_count - a.vote_count)
    .slice(0, 10)
    .sort((a, b) => b.vote_average - a.vote_average);

  return movies;
};

const fetchTopTrendingMovies = async () => {
  const now = new Date(Date.now());
  const fromDate = new Date(now.setFullYear(now.getFullYear() - 1));

  // Top Trending movies params
  // "Trending": relatively new movies with a vote avg > 7 and votes > 50
  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('sort_by', 'primary_release_date.desc');
  params.append('page', 1);
  params.append(
    'primary_release_date.gte',
    fromDate.toISOString().split('T')[0]
  );
  params.append('vote_average.gte', 7);
  params.append('vote_count.gte', 50);

  const res = await axios
    .get(`${tmdbUrl}/discover/movie?${params}`)
    .then((res) => res.data);

  const movies = res.results
    .map((movie) => ({
      ...movie,
      genre_names: movie.genre_ids.map(
        (id) => genres?.find((item) => item.id === id)?.name ?? ''
      ),
    }))
    // .sort((a, b) => new Date(b.release_date) >= new Date(a.release_date) ? 1 : -1)
    .slice(0, 10)
    .sort((a, b) => b.vote_average - a.vote_average);

  return movies;
};

const fetchNowPlayingMovies = async () => {
  // Now Playing movies params
  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
  params.append('sort_by', 'primary_release_date.desc');
  params.append('page', 1);
  params.append(
    'primary_release_date.lte',
    new Date().toISOString().split('T')[0]
  );
  params.append('vote_average.gte', 1);
  params.append('vote_count.gte', 50);

  const res = axios
    .get(`${tmdbUrl}/discover/movie?${params}`)
    .then((res) => res.data);

  const movies = res.results.map((movie) => ({
    ...movie,
    genre_names: movie.genre_ids.map(
      (id) => genres?.find((item) => item.id === id)?.name ?? ''
    ),
  }));

  return movies;
};

const fetchTrendingMoviesByGenres = async () => {
  const now = new Date(Date.now());
  const fromDate = new Date(now.setFullYear(now.getFullYear() - 1));

  const params = new URLSearchParams();
  params.append('api_key', tmdbKey);
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
        .then((data) => {
          // Adds genre names to each movie
          const movies = data.results.map((movie) => ({
            ...movie,
            genre_names: movie.genre_ids.map(
              (id) => genres.find((item) => item.id === genre.id)?.name ?? ''
            ),
          }));

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

const fetchMovies = async () => {
  const redisConnectionString = process.env.UPSTASH_REDIS_REST_URL || '';
  const redisConnectionToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

  const redis = new Redis({
    url: redisConnectionString,
    token: redisConnectionToken,
    agent: new https.Agent({ keepAlive: true }),
  });

  console.log('fetching movies...');

  await fetchGenres();

  fetchTrendingMoviesByGenres()
    .then((movies) => {
      return redis.set(moviesType.TrendingMoviesByGenre, movies);
    })
    .catch(() => {
      console.log('Error when fetching: Trending movies by genre');
    })
    .finally(() => {
      console.log('Trending movies by genre fetching finished.');
    });

  fetchNowPlayingMovies()
    .then((movies) => {
      return redis.set(moviesType.NowPlayingMovies, movies);
    })
    .catch(() => {
      console.log('Error when fetching: Now Playing movies.');
    })
    .finally(() => {
      console.log('Now Playing movies fetching finished.');
    });

  fetchTopPopularMovies()
    .then((movies) => {
      return redis.set(moviesType.TopPopularMovies, movies);
    })
    .catch(() => {
      console.log('Error when fetching: Top Popular movies.');
    })
    .finally(() => {
      console.log('Top Popular movies fetching finished.');
    });

  fetchTopTrendingMovies()
    .then((movies) => {
      return redis.set(moviesType.TopTrendingMovies, movies);
    })
    .catch(() => {
      console.log('Error when fetching: Top Trending movies.');
    })
    .finally(() => {
      console.log('Top Trending movies fetching finished.');
    });

  return;
};

module.exports = createScheduledFunction(
  'Fetch Movies',
  '* 12 * * *',
  fetchMovies
);
