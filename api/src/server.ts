import * as dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import { authPlugin, moviesPlugin, pollsPlugin } from 'plugins';

const fastify = Fastify({
  logger: true,
});

// auth
fastify.register(authPlugin);

// movies
// fastify.register(moviesPlugin);

// polls
// fastify.register(pollsPlugin);

// Server is just limited to listen on
// the specified HTTP methods
fastify.listen({ port: 8080 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
