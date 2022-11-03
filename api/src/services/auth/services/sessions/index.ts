import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import csrfToken from './plugins/csrf-token';
import routes from './plugins/routes';
import session from './plugins/session';

interface SessionPluginOptions extends FastifyPluginOptions {
  sessionSecret: string;
  isDevEnv: boolean;
  domain: string;
}

const sessions: FastifyPluginAsync<SessionPluginOptions> = async (
  fastify,
  opts
) => {
  const { sessionSecret, isDevEnv, domain } = opts;

  // Making use of fastify-plugin due to the csrfToken
  // plugin decorators.
  //
  // IMPORTANT: fastify and fastify-plugin will just allow
  // notify changes to parent not the other ancestors
  fastify.register(session, { sessionSecret, isDevEnv, domain });
  fastify.register(csrfToken);
  fastify.register(routes, { prefix: '/trpc/sessionRoutes' });
};

// Making use of fastify-plugin due to the csrfToken
// plugin decorators.
//
// IMPORTANT: fastify and fastify-plugin will just allow
// notify changes to parent not the other ancestors
export default fastifyPlugin(sessions);
