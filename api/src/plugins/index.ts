import prismaClient from './prismaClient';
import redisClient from './redisClient';
import authPlugin from './authPlugin';
import moviesPlugin from './moviesPlugin';
import pollPlugin from './pollPlugin';

export { prismaClient, redisClient, authPlugin, moviesPlugin, pollPlugin };
