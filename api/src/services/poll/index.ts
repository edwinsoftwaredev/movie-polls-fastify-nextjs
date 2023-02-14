import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Movie } from '../movies/types';
import routes from './plugins/routes';

interface PollPluginOpts extends FastifyPluginOptions {}

const poll: FastifyPluginAsync<PollPluginOpts> = async (fastify) => {
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
        createdAt: true,
        MoviePolls: true,
      },
    });

  // TODO: rate limit
  // TODO: set limit
  const createPoll = (userId: string, pollName: string, movieId: Movie['id']) =>
    fastify.prismaClient.poll.create({
      data: {
        name: pollName,
        authorId: userId,
        ...(movieId
          ? {
              MoviePolls: {
                create: {
                  movieId: movieId,
                },
              },
            }
          : {}),
      },
      include: {
        MoviePolls: true,
      },
    });

  fastify.decorate('polls', {
    getInactivePolls,
    createPoll,
  });

  fastify.register(routes, { prefix: '/trpc/pollRoutes' });
};

export default fastifyPlugin(poll);
