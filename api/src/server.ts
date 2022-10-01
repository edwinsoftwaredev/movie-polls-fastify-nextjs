import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastifyCors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import Fastify from 'fastify';
import { authPlugin, moviesPlugin, pollsPlugin } from 'plugins';
import appRouter from 'trpc/server';
import * as dotenv from 'dotenv';
import { createContext } from 'trpc/context';
import fastifyHelmet from '@fastify/helmet';
dotenv.config();

const fastify = Fastify({
  logger: true,
});

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
// fastify.register(moviesPlugin);

// polls plugin
// fastify.register(pollsPlugin);

// routes plugin
fastify.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
  },
});

// Server is just limited to listen on
// the specified HTTP methods
fastify.listen({ port: 8080 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
