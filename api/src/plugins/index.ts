import prismaClient from './prisma-client';
import redisClient from './redis-client';
import authPlugin from './auth-plugin';
import publicMoviesPlugin from './public-movie-plugin';
import moviesPlugin from './movie-plugins';
import pollPlugin from './poll-plugin';

export {
  prismaClient,
  redisClient,
  authPlugin,
  publicMoviesPlugin,
  moviesPlugin,
  pollPlugin,
};
