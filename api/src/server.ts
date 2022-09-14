import * as dotenv from 'dotenv';
dotenv.config();

import Fastify, { FastifyPluginAsync } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCsrf from '@fastify/csrf-protection';
import { auth, movies, polls } from 'services';
import prismaClient from './plugins/prismaClient';
import redisClient from './plugins/redisClient';

const fastify = Fastify({
  logger: true,
});

// auth
fastify.register<FastifyPluginAsync>(async (instance, opts) => {
  instance.register(prismaClient, {});
  instance.register(redisClient, { url: '' });
  instance.register(auth);
});

// movies
fastify.register<FastifyPluginAsync>(async (instance, opts) => {
  instance.register(prismaClient, {});
  instance.register(redisClient, { url: '' });
  instance.register(movies);
});

// polls
fastify.register<FastifyPluginAsync>(async (instance, opts) => {
  instance.register(prismaClient, {});
  instance.register(redisClient, { url: '' });
  instance.register(polls);
});

fastify.register(fastifyCookie, { secret: 'CHANGEME' });
fastify.register(fastifyCsrf, { cookieOpts: { signed: true } });

// Server is just limited to listen on
// the specified methods
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
