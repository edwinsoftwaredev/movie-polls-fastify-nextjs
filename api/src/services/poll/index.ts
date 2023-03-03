import { Poll, Prisma, UserSession, VotingToken } from '@prisma/client';
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Movie } from '../public-movies/types';
import routes from './plugins/routes';

interface PollPluginOpts extends FastifyPluginOptions {}

const poll: FastifyPluginAsync<PollPluginOpts> = async (fastify) => {
  const getInactivePolls = async (userSession: UserSession) => {
    return fastify.prismaClient.poll.findMany({
      where: {
        authorId: userSession.userId!,
        isActive: false,
      },
      include: {
        MoviePoll: true,
      },
    });
  };

  const getActivePolls = (userSession: UserSession) => {
    return fastify.prismaClient.poll.findMany({
      where: {
        authorId: userSession.userId!,
        isActive: true,
      },
      include: {
        MoviePoll: true,
      },
    });
  };

  // TODO: rate limit
  const createPoll = async (
    userSession: UserSession,
    pollName: string,
    movieId: Movie['id']
  ) => {
    const pollsCount = await fastify.prismaClient.poll.count({
      where: {
        authorId: userSession.userId!,
      },
    });

    if (pollsCount > 50) throw new Error('LIMIT_REACHED');

    return fastify.prismaClient.poll.create({
      data: {
        name: pollName,
        authorId: userSession.userId!,
        ...(movieId
          ? {
              MoviePoll: {
                create: {
                  movieId: movieId,
                },
              },
            }
          : {}),
      },
      include: {
        MoviePoll: true,
      },
    });
  };

  const getPoll = async (userSession: UserSession, pollId: Poll['id']) => {
    const poll = await fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: pollId,
      },
      include: {
        MoviePoll: true,
        VotingToken: true,
      },
    });

    if (poll.authorId !== userSession.userId) throw new Error('UNAUTHORIZED');

    return poll;
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
      throw new Error('UNAUTHORIZED');

    if (currentPoll.isActive && poll.isActive) throw new Error('ACTIVE_POLL');

    if (poll.expiresOn) {
      const maxDate = new Date(poll.expiresOn);
      maxDate.setDate(maxDate.getDate() + 28);

      if (poll.expiresOn > maxDate) throw new Error('INVALID_DATE');
    }

    const { authorId, createdAt, id, ...rest } = poll;

    // NOTE: Poll updates cascade to MoviePoll
    return fastify.prismaClient.poll.update({
      data: {
        ...rest,
        ...(currentPoll.isActive && !poll.isActive
          ? {
              MoviePoll: {
                updateMany: {
                  data: { voteCount: 0 },
                  where: { pollId: poll.id },
                },
              },
              votingTokenCount: 0,
              VotingToken: {
                deleteMany: { pollId: poll.id },
              },
            }
          : {}),
      },
      where: {
        id: poll.id,
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
      throw new Error('UNAUTHORIZED');

    // NOTE: Poll deletes cascade to MoviePoll
    return fastify.prismaClient.poll.delete({
      where: {
        id: pollId,
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
      throw new Error('UNAUTHORIZED');

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

  const addVotingTokens = async (
    userSession: UserSession,
    pollId: Poll['id'],
    amount: number = 1
  ) => {
    if (amount === 0) throw new Error('LIMIT_REACHED');

    const currentPoll = await fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: pollId,
      },
      select: {
        authorId: true,
        isActive: true,
        votingTokenCount: true,
      },
    });

    if (currentPoll.authorId !== userSession.userId)
      throw new Error('UNAUTHORIZED');

    if (currentPoll.isActive) throw new Error('ACTIVE_POLL');

    if (currentPoll.votingTokenCount + amount > 50)
      throw new Error('LIMIT_REACHED');

    return fastify.prismaClient.poll.update({
      where: {
        id: pollId,
      },
      data: {
        votingTokenCount: currentPoll.votingTokenCount + amount,
        VotingToken: {
          createMany: {
            data: new Array<Prisma.VotingTokenCreateManyPollInput>(amount).fill(
              {}
            ),
          },
        },
      },
      // NOTE: the createMany API does not return the created records
      // and the include API will return ALL the related records
      include: {
        VotingToken: true,
      },
    });
  };

  const updateVotingToken = async (
    userSession: UserSession,
    votingToken: VotingToken
  ) => {
    const currentPoll = await fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: votingToken.pollId,
      },
      select: {
        authorId: true,
        isActive: true,
        votingTokenCount: true,
      },
    });

    if (currentPoll.authorId !== userSession.userId)
      throw new Error('UNAUTHORIZED');

    if (currentPoll.isActive) throw new Error('ACTIVE_POLL');

    return fastify.prismaClient.votingToken.update({
      where: {
        id_pollId: {
          id: votingToken.id,
          pollId: votingToken.pollId,
        },
      },
      data: {
        label: votingToken.label,
        unshared: votingToken.unshared,
      },
    });
  };

  const removeVotingToken = async (
    userSession: UserSession,
    pollId: Poll['id'],
    votingTokenId: VotingToken['id']
  ) => {
    const currentPoll = await fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: pollId,
      },
      select: {
        authorId: true,
        isActive: true,
        votingTokenCount: true,
      },
    });

    if (currentPoll.authorId !== userSession.userId)
      throw new Error('UNAUTHORIZED');

    if (currentPoll.isActive) throw new Error('ACTIVE_POLL');

    return fastify.prismaClient.poll.update({
      where: {
        id: pollId,
      },
      data: {
        votingTokenCount: currentPoll.votingTokenCount - 1,
        VotingToken: {
          delete: {
            id_pollId: {
              id: votingTokenId,
              pollId: pollId,
            },
          },
        },
      },
      // NOTE: the createMany API does not return the created records
      // and the include API will return ALL the related records
      include: {
        VotingToken: true,
      },
    });
  };

  fastify.decorate('polls', {
    getActivePolls,
    getInactivePolls,
    createPoll,
    getPoll,
    updatePoll,
    removePoll,
    addMovie,
    removeMovie,
    addVotingTokens,
    updateVotingToken,
    removeVotingToken,
  });

  fastify.register(routes, { prefix: '/trpc/pollRoutes' });
};

export default fastifyPlugin(poll);
