import dynamoDBClient from './dynamodb-client';
import redisClient from './redis-client';
import authPlugin from './auth-plugin';
import publicMoviesPlugin from './public-movie-plugin';
import moviesPlugin from './movies-plugin';
import pollPlugin from './poll-plugin';
import publicPollPlugin from './public-poll-plugin';

export {
  dynamoDBClient,
  redisClient,
  authPlugin,
  publicMoviesPlugin,
  moviesPlugin,
  pollPlugin,
  publicPollPlugin,
};
