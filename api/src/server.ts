import fastifyCors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import { FastifyPluginAsync } from 'fastify';
import {
  authPlugin,
  publicMoviesPlugin,
  moviesPlugin,
  pollPlugin,
  publicPollPlugin,
} from './plugins';
import * as dotenv from 'dotenv';
import fastifyHelmet from '@fastify/helmet';

dotenv.config();

const serverlessFunc: FastifyPluginAsync = async (fastify) => {
  // helmet plugin
  fastify.register(fastifyHelmet);

  // CORS configuration
  fastify.register(fastifyCors, {
    origin: [`${process.env.WEB_CLIENT_ORIGIN}`],
    credentials: true,
  });

  // Parse application/x-www-form-urlencoded req body
  fastify.register(fastifyFormbody);

  // Protected routes
  fastify.register(async (instance) => {
    instance.register(authPlugin);
    instance.register(pollPlugin);
    instance.register(moviesPlugin);

    fastify.register(publicPollPlugin);
  });

  // Public routes
  fastify.register(publicMoviesPlugin);
};

export default serverlessFunc;
