import fastifyCors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import { FastifyPluginAsync } from 'fastify';
import { authPlugin, moviesPlugin, pollPlugin } from './plugins';
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

  // auth plugin
  fastify.register(authPlugin);

  // movies plugin
  fastify.register(moviesPlugin);

  // poll plugin
  fastify.register(pollPlugin);
};

export default serverlessFunc;
