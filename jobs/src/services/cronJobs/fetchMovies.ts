import { createScheduledFunction } from 'inngest';

const fetchMovies = async () => {
  const tmdbKey = `${process.env.TMDB_API_KEY}`;
  const tmdbUrl = `${process.env.TMDB_API_URL}`;

  const redisConnectionString = process.env.UPSTASH_REDIS_REST_URL || '';
  const redisConnectionToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

  return;
}

export default createScheduledFunction(
  'Fetch Movies',
  '*/5 * * * *',
  fetchMovies,
);
