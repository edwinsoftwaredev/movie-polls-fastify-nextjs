import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastifyCors from '@fastify/cors';
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
  origin: (origin, callback) => {
    const hostname = new URL(origin).hostname;
    const allowedHostname = process.env.HOSTNAME;
    if (hostname === allowedHostname) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin Not Allowed'), false);
  },
  credentials: true,
});

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
