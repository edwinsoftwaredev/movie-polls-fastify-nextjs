import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import account from './services/account';
import sessions from './services/sessions';

interface AuthPluginOptions extends FastifyPluginOptions {
  sessionSecret: string;
  isDevEnv: boolean;
  domain: string;
}

// auth plugin
const auth: FastifyPluginAsync<AuthPluginOptions> = async (fastify, opts) => {
  const { sessionSecret, isDevEnv, domain } = opts;
  fastify.register(sessions, { sessionSecret, isDevEnv, domain });
  fastify.register(account);
};

export default fastifyPlugin(auth);
