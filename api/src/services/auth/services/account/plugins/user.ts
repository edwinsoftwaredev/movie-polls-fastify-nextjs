import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

const user: FastifyPluginAsync = async (fastify) => {
  // TODO: exception handling
  const getUser = async (id: string) =>
    fastify.prismaClient.user.findUnique({
      where: {
        id,
      },
    });

  const decorators = {
    getUser,
  };

  fastify.decorate('account', {
    ...fastify.account,
    user: decorators,
  });

  // Add csrf protection on every request
  fastify.addHook('onRequest', fastify.csrfProtection);
};

export default fastifyPlugin(user);
