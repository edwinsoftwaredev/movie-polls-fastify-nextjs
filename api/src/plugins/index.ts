import prismaClient from './prismaClient';
import redisClient from './redisClient';
import authPlugin from './authPlugin';
import moviesPlugin from './moviesPlugin';
import pollsPlugin from './pollsPlugin';
import trpcPlugin from './trpcPlugin';

export {
  prismaClient,
  redisClient,
  trpcPlugin,
  authPlugin,
  moviesPlugin,
  pollsPlugin,
};
