import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { routes } from './services/plugins';
import sessions from './services/sessions';

interface AuthPluginOptions extends FastifyPluginOptions {
  sessionSecret: string;
  isDevEnv: boolean;
}

// auth plugin
const auth: FastifyPluginAsync<AuthPluginOptions> = async (fastify, opts) => {
  const { sessionSecret, isDevEnv } = opts;
  fastify.prismaClient;
  fastify.redisClient;

  fastify.register(sessions, { sessionSecret, isDevEnv });
  fastify.register(routes);

  // register auth routes
  // register other things
};

export default fastifyPlugin(auth);
