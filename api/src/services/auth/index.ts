import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import sessions from './services/sessions';

interface AuthPluginOptions extends FastifyPluginOptions {}

// auth plugin
const auth: FastifyPluginAsync<AuthPluginOptions> = async (fastify, opts) => {
  fastify.prismaClient;
  fastify.redisClient;
  opts;

  fastify.register(sessions);

  // register auth routes
  // register other things
};

export default auth;
