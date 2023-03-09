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
  ) =>
    fastify.prismaClient.$transaction(
      async (tx) => {
        const pollsCount = await tx.poll.count({
          where: {
            authorId: userSession.userId!,
          },
        });

        if (pollsCount > 50) throw new Error('LIMIT_REACHED');

        return tx.poll.create({
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
      },
      { isolationLevel: 'Serializable' }
    );

  const getPoll = async (userSession: UserSession, pollId: Poll['id']) => {
    const poll = await fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: pollId,
      },
      include: {
        MoviePoll: true,
      },
    });

    if (poll.authorId !== userSession.userId) throw new Error('UNAUTHORIZED');

    return poll;
  };

  const updatePoll = async (userSession: UserSession, poll: Poll) =>
    fastify.prismaClient.$transaction(
      async (tx) => {
        const currentPoll = await tx.poll.findUniqueOrThrow({
          where: {
            id: poll.id,
          },
          select: {
            authorId: true,
            isActive: true,
            expiresOn: true,
            votingTokenCount: true,
          },
        });

        // Checks permissions
        if (currentPoll.authorId !== userSession.userId)
          throw new Error('UNAUTHORIZED');

        if (
          currentPoll.isActive &&
          currentPoll.expiresOn &&
          currentPoll.expiresOn < new Date()
        )
          throw new Error('ACTIVE_POLL');

        if (currentPoll.isActive && poll.isActive)
          throw new Error('ACTIVE_POLL');

        if (!currentPoll.isActive && poll.isActive && !poll.expiresOn)
          throw new Error('INVALID_DATE');

        if (poll.expiresOn) {
          const maxDate = new Date();
          maxDate.setDate(maxDate.getDate() + 28);

          if (poll.expiresOn > maxDate) throw new Error('INVALID_DATE');
        }

        // NOTE: Poll updates cascade to MoviePoll
        return tx.poll.update({
          data: {
            isActive: poll.isActive,
            name: poll.name,
            expiresOn: poll.expiresOn,
            ...(currentPoll.isActive && !poll.isActive
              ? {
                  expiresOn: null,
                  remainingVotingTokenCount: currentPoll.votingTokenCount,
                  MoviePoll: {
                    updateMany: {
                      data: { voteCount: 0 },
                      where: { pollId: poll.id },
                    },
                  },
                  VotingToken: {
                    updateMany: {
                      where: { pollId: poll.id },
                      data: {
                        unused: true,
                      },
                    },
                  },
                }
              : {}),
          },
          where: {
            id: poll.id,
          },
        });
      },
      { isolationLevel: 'Serializable' }
    );

  const removePoll = async (userSession: UserSession, pollId: Poll['id']) =>
    fastify.prismaClient.$transaction(
      async (tx) => {
        const currentPoll = await tx.poll.findUniqueOrThrow({
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
        return tx.poll.delete({
          where: {
            id: pollId,
          },
        });
      },
      { isolationLevel: 'Serializable' }
    );

  const addMovie = async (
    userSession: UserSession,
    pollId: Poll['id'],
    movieId: Movie['id']
  ) =>
    fastify.prismaClient.$transaction(
      async (tx) => {
        const currentPoll = await tx.poll.findUniqueOrThrow({
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

        const moviePollCount = await tx.moviePoll.count({
          where: {
            pollId,
          },
        });

        if (moviePollCount >= 5) throw new Error('LIMIT_REACHED');

        return tx.moviePoll.create({
          data: {
            movieId,
            pollId,
          },
        });
      },
      { isolationLevel: 'Serializable' }
    );

  const removeMovie = async (
    userSession: UserSession,
    pollId: Poll['id'],
    movieId: Movie['id']
  ) =>
    fastify.prismaClient.$transaction(
      async (tx) => {
        const currentPoll = await tx.poll.findUniqueOrThrow({
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

        return tx.moviePoll.delete({
          where: {
            pollId_movieId: {
              movieId,
              pollId,
            },
          },
        });
      },
      { isolationLevel: 'Serializable' }
    );

  const addVotingTokens = async (
    userSession: UserSession,
    pollId: Poll['id'],
    amount: number = 1
  ) =>
    fastify.prismaClient.$transaction(
      async (tx) => {
        if (amount < 1) throw new Error('LIMIT_REACHED');

        const currentPoll = await tx.poll.findUniqueOrThrow({
          where: {
            id: pollId,
          },
          select: {
            authorId: true,
            isActive: true,
            expiresOn: true,
            votingTokenCount: true,
          },
        });

        if (currentPoll.authorId !== userSession.userId)
          throw new Error('UNAUTHORIZED');

        if (
          currentPoll.isActive &&
          currentPoll.expiresOn &&
          currentPoll.expiresOn < new Date()
        )
          throw new Error('ACTIVE_POLL');

        if (currentPoll.votingTokenCount + amount > 50)
          throw new Error('LIMIT_REACHED');

        return tx.poll.update({
          where: {
            id: pollId,
          },
          data: {
            votingTokenCount: {
              increment: amount,
            },
            remainingVotingTokenCount: {
              increment: amount,
            },
            VotingToken: {
              createMany: {
                data: new Array<Prisma.VotingTokenCreateManyPollInput>(
                  amount
                ).fill({}),
              },
            },
          },
          // NOTE: the createMany API does not return the created records
          // and the include API will return ALL the related records
          include: {
            VotingToken: true,
          },
        });
      },
      { isolationLevel: 'Serializable' }
    );

  const getVotingTokens = async (
    userSession: UserSession,
    pollId: Poll['id']
  ) => {
    const poll = await fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: pollId,
      },
      select: {
        VotingToken: true,
        authorId: true,
      },
    });

    if (poll.authorId !== userSession.userId) throw new Error('UNAUTHORIZED');

    return poll.VotingToken;
  };

  const updateVotingToken = async (
    userSession: UserSession,
    votingToken: VotingToken
  ) =>
    fastify.prismaClient.$transaction(
      async (tx) => {
        const currentPoll = await tx.poll.findUniqueOrThrow({
          where: {
            id: votingToken.pollId,
          },
          select: {
            authorId: true,
            isActive: true,
            expiresOn: true,
            votingTokenCount: true,
          },
        });

        if (currentPoll.authorId !== userSession.userId)
          throw new Error('UNAUTHORIZED');

        if (
          currentPoll.isActive &&
          currentPoll.expiresOn &&
          currentPoll.expiresOn < new Date()
        )
          throw new Error('ACTIVE_POLL');

        return tx.votingToken.update({
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
      },
      { isolationLevel: 'Serializable' }
    );

  const removeVotingToken = async (
    userSession: UserSession,
    pollId: Poll['id'],
    votingTokenId: VotingToken['id']
  ) =>
    fastify.prismaClient.$transaction(
      async (tx) => {
        const currentPoll = await tx.poll.findUniqueOrThrow({
          where: {
            id: pollId,
          },
          select: {
            authorId: true,
            isActive: true,
            expiresOn: true,
            votingTokenCount: true,
            remainingVotingTokenCount: true,
            VotingToken: {
              where: {
                id: votingTokenId,
                pollId: pollId,
              },
            },
          },
        });

        if (currentPoll.authorId !== userSession.userId)
          throw new Error('UNAUTHORIZED');

        if (
          currentPoll.isActive &&
          currentPoll.expiresOn &&
          currentPoll.expiresOn < new Date()
        )
          throw new Error('ACTIVE_POLL');

        return tx.poll.update({
          where: {
            id: pollId,
          },
          data: {
            votingTokenCount: {
              decrement: 1,
            },
            remainingVotingTokenCount: {
              decrement: currentPoll.VotingToken.at(0)?.unused ? 1 : 0,
            },
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
      },
      { isolationLevel: 'Serializable' }
    );

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
    getVotingTokens,
    updateVotingToken,
    removeVotingToken,
  });

  fastify.register(routes, { prefix: '/trpc/pollRoutes' });
};

export default fastifyPlugin(poll);
