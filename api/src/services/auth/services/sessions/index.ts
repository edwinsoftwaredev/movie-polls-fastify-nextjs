import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import csrfToken from './plugins/csrf-token';
import session from './plugins/session';

interface SessionPluginOptions extends FastifyPluginOptions {
  sessionSecret: string;
  isDevEnv: boolean;
}

const sessions: FastifyPluginAsync<SessionPluginOptions> = async (
  fastify,
  opts
) => {
  const { sessionSecret, isDevEnv } = opts;

  // Making use of fastify-plugin due to the csrfToken
  // plugin decorators.
  //
  // IMPORTANT: fastify and fastify-plugin will just allow
  // notify changes to parent not the other ancestors
  fastify.register(session, { sessionSecret, isDevEnv });
  fastify.register(csrfToken);
};

// Making use of fastify-plugin due to the csrfToken
// plugin decorators.
//
// IMPORTANT: fastify and fastify-plugin will just allow
// notify changes to parent not the other ancestors
export default fastifyPlugin(sessions);
