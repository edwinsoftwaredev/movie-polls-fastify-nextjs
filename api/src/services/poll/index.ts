import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import routes from './plugins/routes';

interface PollPluginOpts extends FastifyPluginOptions {}

const poll: FastifyPluginAsync<PollPluginOpts> = async (fastify) => {
  // TODO: add movies
  const getInactivePolls = (userId: string) =>
    fastify.prismaClient.poll.findMany({
      where: {
        authorId: userId,
        isActive: false,
      },
      select: {
        name: true,
        id: true,
        expiresOn: true,
      },
    });

  fastify.decorate('polls', {
    getInactivePolls,
  });
  fastify.register(routes, { prefix: '/trpc/pollRoutes' });
};

export default fastifyPlugin(poll);
