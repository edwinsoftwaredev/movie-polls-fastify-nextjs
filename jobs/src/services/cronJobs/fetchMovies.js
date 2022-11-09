'use strict';
const { createScheduledFunction } = require('inngest');

const fetchMovies = async () => {
  const tmdbKey = `${process.env.TMDB_API_KEY}`;
  const tmdbUrl = `${process.env.TMDB_API_URL}`;

  const redisConnectionString = process.env.UPSTASH_REDIS_REST_URL || '';
  const redisConnectionToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

  console.log('fetching movies...');
  console.log('movies fetched')

  return;
}

module.exports = createScheduledFunction(
  'Fetch Movies',
  '* 12 * * *',
  fetchMovies,
);
