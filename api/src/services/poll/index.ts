import { Poll, Prisma, User, UserSession } from '@prisma/client';
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Movie } from '../movies/types';
import routes from './plugins/routes';

interface PollPluginOpts extends FastifyPluginOptions {}

const poll: FastifyPluginAsync<PollPluginOpts> = async (fastify) => {
  const getInactivePolls = (userSession: UserSession) => {
    return fastify.prismaClient.poll.findMany({
      where: {
        authorId: userSession.userId!,
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
  };

  const getActivePolls = (userSession: UserSession) => {
    return fastify.prismaClient.poll.findMany({
      where: {
        authorId: userSession.userId!,
        isActive: true,
      },
      select: {
        name: true,
        id: true,
        expiresOn: true,
        createdAt: true,
        MoviePolls: true,
      },
    });
  };

  // TODO: rate limit
  // TODO: set limit
  const createPoll = async (
    userSession: UserSession,
    pollName: string,
    movieId: Movie['id']
  ) => {
    const inactivePollsCount = await fastify.prismaClient.poll.count({
      where: {
        authorId: userSession.userId!,
        isActive: false,
      },
    });

    if (inactivePollsCount >= 10) throw new Error('LIMIT_REACHED');

    return fastify.prismaClient.poll.create({
      data: {
        name: pollName,
        authorId: userSession.userId!,
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
      select: {
        name: true,
        id: true,
        expiresOn: true,
        createdAt: true,
        MoviePolls: true,
      },
    });
  };

  const updatePoll = async (userSession: UserSession, poll: Poll) => {
    const currentPoll = await fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: poll.id,
      },
      select: {
        authorId: true,
        isActive: true,
      },
    });

    // Checks permissions
    if (currentPoll.authorId !== userSession.userId)
      return new Error('UNAUTHORIZED');

    if (currentPoll.isActive && poll.isActive) return new Error('ACTIVE_POLL');

    const { authorId, createdAt, id, ...rest } = poll;

    // NOTE: Poll updates cascade to MoviePoll
    return fastify.prismaClient.poll.update({
      data: {
        ...rest,
        ...(currentPoll.isActive && !poll.isActive
          ? {
              MoviePolls: {
                updateMany: {
                  data: { voteCount: 0 },
                  where: { pollId: poll.id },
                },
              },
            }
          : {}),
      },
      where: {
        id: poll.id,
      },
      select: {
        name: true,
        id: true,
        expiresOn: true,
        createdAt: true,
      },
    });
  };

  const removePoll = async (userSession: UserSession, pollId: Poll['id']) => {
    const currentPoll = await fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: pollId,
      },
      select: {
        authorId: true,
      },
    });

    // Checks permissions
    if (currentPoll.authorId !== userSession.userId)
      return new Error('UNAUTHORIZED');

    // NOTE: Poll deletes cascade to MoviePoll
    return fastify.prismaClient.poll.delete({
      where: {
        id: pollId,
      },
      select: {
        name: true,
        id: true,
        expiresOn: true,
        createdAt: true,
        isActive: true,
      },
    });
  };

  const addMovie = async (
    userSession: UserSession,
    pollId: Poll['id'],
    movieId: Movie['id']
  ) => {
    const currentPoll = await fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: pollId,
      },
      select: {
        isActive: true,
        authorId: true,
      },
    });

    // Checks permissions
    if (currentPoll.authorId !== userSession.userId)
      return new Error('UNAUTHORIZED');

    if (currentPoll.isActive) throw new Error('ACTIVE_POLL');
    const moviePollCount = await fastify.prismaClient.moviePoll.count({
      where: {
        pollId,
      },
    });
    if (moviePollCount >= 5) throw new Error('LIMIT_REACHED');

    return fastify.prismaClient.moviePoll.create({
      data: {
        movieId,
        pollId,
      },
    });
  };

  const removeMovie = async (
    userSession: UserSession,
    pollId: Poll['id'],
    movieId: Movie['id']
  ) => {
    const currentPoll = await fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: pollId,
      },
      select: {
        authorId: true,
        isActive: true,
      },
    });

    // Checks permissions
    if (currentPoll.authorId !== userSession.userId)
      throw new Error('UNAUTHORIZED');

    if (currentPoll.isActive) throw new Error('ACTIVE_POLL');

    return fastify.prismaClient.moviePoll.delete({
      where: {
        pollId_movieId: {
          movieId,
          pollId,
        },
      },
    });
  };

  fastify.decorate('polls', {
    getActivePolls,
    getInactivePolls,
    createPoll,
    updatePoll,
    removePoll,
    addMovie,
    removeMovie,
  });

  fastify.register(routes, { prefix: '/trpc/pollRoutes' });
};

export default fastifyPlugin(poll);
