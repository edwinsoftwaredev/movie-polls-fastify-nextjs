import * as dotenv from 'dotenv';
dotenv.config();

import Fastify, { FastifyPluginAsync } from 'fastify';
// import { auth, movies, polls } from 'services';
import { prismaClient, redisClient } from './plugins';

const fastify = Fastify({
  logger: true,
});

// Using the same connection URL connection string to the Redis server
// for each Fastify plugin
const redisConnectionString = process.env.SESSION_CACHE_URL || '';

// auth
fastify.register<FastifyPluginAsync>(async (instance, opts) => {
  instance.register(prismaClient, {});
  instance.register(redisClient, { url: redisConnectionString });
  // instance.register(auth);
});

// movies
fastify.register<FastifyPluginAsync>(async (instance, opts) => {
  instance.register(prismaClient, {});
  instance.register(redisClient, { url: redisConnectionString });
  // instance.register(movies);
});

// polls
fastify.register<FastifyPluginAsync>(async (instance, opts) => {
  instance.register(prismaClient, {});
  instance.register(redisClient, { url: redisConnectionString });
  // instance.register(polls);
});

// Server is just limited to listen on
// the specified HTTP methods
fastify
  .route({
    method: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
    url: '/',
    handler: async () => {},
  })
  .listen({ port: 8080 }, function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  });
