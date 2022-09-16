import prismaClient from './prismaClient';
import redisClient from './redisClient';
import authPlugin from './authPlugin';
import moviesPlugin from './moviesPlugin';
import pollsPlugin from './pollsPlugin';

export { prismaClient, redisClient, authPlugin, moviesPlugin, pollsPlugin };
