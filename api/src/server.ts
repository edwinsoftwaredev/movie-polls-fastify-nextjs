import fastifyCors from '@fastify/cors';
import * as dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import { authPlugin, moviesPlugin, pollsPlugin } from 'plugins';

const fastify = Fastify({
  logger: true,
});

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

// Server is just limited to listen on
// the specified HTTP methods
fastify.listen({ port: 8080 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
