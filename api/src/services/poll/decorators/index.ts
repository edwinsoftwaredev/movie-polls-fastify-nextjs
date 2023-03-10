import { Poll, Prisma, UserSession, VotingToken } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { Movie } from 'src/services/public-movies/types';

export const getInactivePolls =
  (fastify: FastifyInstance) => async (userSession: UserSession) => {
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

export const getActivePolls =
  (fastify: FastifyInstance) => async (userSession: UserSession) => {
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
export const createPoll =
  (fastify: FastifyInstance) =>
  (userSession: UserSession, pollName: string, movieId: Movie['id']) =>
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

export const getPoll =
  (fastify: FastifyInstance) =>
  async (userSession: UserSession, pollId: Poll['id']) => {
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

export const updatePoll =
  (fastify: FastifyInstance) => async (userSession: UserSession, poll: Poll) =>
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

export const removePoll =
  (fastify: FastifyInstance) =>
  (userSession: UserSession, pollId: Poll['id']) =>
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

export const addMovie =
  (fastify: FastifyInstance) =>
  (userSession: UserSession, pollId: Poll['id'], movieId: Movie['id']) =>
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

export const removeMovie =
  (fastify: FastifyInstance) =>
  (userSession: UserSession, pollId: Poll['id'], movieId: Movie['id']) =>
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

export const addVotingTokens =
  (fastify: FastifyInstance) =>
  (userSession: UserSession, pollId: Poll['id'], amount: number = 1) =>
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

export const getVotingTokens =
  (fastify: FastifyInstance) =>
  async (userSession: UserSession, pollId: Poll['id']) => {
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

export const updateVotingToken =
  (fastify: FastifyInstance) =>
  (userSession: UserSession, votingToken: VotingToken) =>
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

export const removeVotingToken =
  (fastify: FastifyInstance) =>
  (
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

        const votingToken = currentPoll.VotingToken.at(0);

        return tx.poll.update({
          where: {
            id: pollId,
          },
          data: {
            votingTokenCount: {
              decrement: 1,
            },
            remainingVotingTokenCount: {
              decrement: votingToken?.unused ? 1 : 0,
            },
            VotingToken: {
              delete: {
                id_pollId: {
                  id: votingTokenId,
                  pollId: pollId,
                },
              },
            },
            MoviePoll: {
              ...(votingToken &&
              votingToken.unused === false &&
              votingToken.movieId
                ? {
                    update: {
                      where: {
                        pollId_movieId: {
                          pollId: pollId,
                          movieId: votingToken.movieId,
                        },
                      },
                      data: {
                        voteCount: {
                          decrement: 1,
                        },
                        VotingToken: {
                          disconnect: {
                            id_pollId: {
                              id: votingToken.id,
                              pollId: votingToken.pollId,
                            },
                          },
                        },
                      },
                    },
                  }
                : {}),
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

export type GetInactivePolls = ReturnType<typeof getInactivePolls>;
export type GetActivePolls = ReturnType<typeof getActivePolls>;
export type CreatePoll = ReturnType<typeof createPoll>;
export type GetPoll = ReturnType<typeof getPoll>;
export type UpdatePoll = ReturnType<typeof updatePoll>;
export type RemovePoll = ReturnType<typeof removePoll>;
export type AddMovie = ReturnType<typeof addMovie>;
export type RemoveMovie = ReturnType<typeof removeMovie>;
export type AddVotingTokens = ReturnType<typeof addVotingTokens>;
export type GetVotingTokens = ReturnType<typeof getVotingTokens>;
export type UpdateVotingToken = ReturnType<typeof updateVotingToken>;
export type RemoveVotingToken = ReturnType<typeof removeVotingToken>;
