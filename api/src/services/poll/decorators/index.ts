import { Poll, Prisma, UserSession, VotingToken } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { FastifyInstance } from 'fastify';
import { Movie } from '../../../../src/services/public-movies/types';

export const getInactivePolls =
  (fastify: FastifyInstance) => async (userSession: UserSession) =>
    fastify.prismaClient.poll
      .findMany({
        where: {
          authorId: userSession.userId!,
          isActive: false,
        },
        select: {
          authorId: true,
          createdAt: true,
          id: true,
          expiresOn: true,
          isActive: true,
          name: true,
          MoviePoll: {
            select: {
              movieId: true,
              pollId: true,
              _count: {
                select: {
                  VotingToken: true,
                },
              },
            },
          },
          VotingToken: {
            select: {
              unused: true,
            },
          },
        },
      })
      .then((polls) =>
        polls.map((p) => {
          const { VotingToken, ...rest } = p;

          return {
            ...rest,
            votingTokenCount: VotingToken.length,
            remainingVotingTokenCount: VotingToken.filter(
              (vt) => vt.unused === true
            ).length,
          };
        })
      );

export const getActivePolls =
  (fastify: FastifyInstance) => async (userSession: UserSession) =>
    fastify.prismaClient.poll
      .findMany({
        where: {
          authorId: userSession.userId!,
          isActive: true,
        },
        select: {
          authorId: true,
          createdAt: true,
          id: true,
          expiresOn: true,
          isActive: true,
          name: true,
          MoviePoll: {
            select: {
              movieId: true,
              pollId: true,
              _count: {
                select: {
                  VotingToken: true,
                },
              },
            },
          },
          VotingToken: {
            select: {
              unused: true,
            },
          },
        },
      })
      .then((polls) =>
        polls.map((p) => {
          const { VotingToken, ...rest } = p;

          return {
            ...rest,
            votingTokenCount: VotingToken.length,
            remainingVotingTokenCount: VotingToken.filter((vt) => vt.unused)
              .length,
          };
        })
      );

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
    const result = await fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: pollId,
      },
      select: {
        authorId: true,
        createdAt: true,
        id: true,
        expiresOn: true,
        isActive: true,
        name: true,
        MoviePoll: {
          select: {
            movieId: true,
            pollId: true,
            _count: {
              select: {
                VotingToken: true,
              },
            },
          },
        },
        VotingToken: {
          select: {
            unused: true,
          },
        },
      },
    });

    if (result.authorId !== userSession.userId) throw new Error('UNAUTHORIZED');

    const { VotingToken, ...rest } = result;

    return {
      ...rest,
      votingTokenCount: VotingToken.length,
      remainingVotingTokenCount: VotingToken.filter((vt) => vt.unused).length,
    };
  };

export const updatePoll =
  (fastify: FastifyInstance) =>
  async (userSession: UserSession, poll: Omit<Poll, 'createdAt'>) =>
    fastify.prismaClient
      .$transaction(
        async (tx) => {
          const currentPoll = await tx.poll.findUniqueOrThrow({
            where: {
              id: poll.id,
            },
            select: {
              authorId: true,
              isActive: true,
              expiresOn: true,
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
                    VotingToken: {
                      updateMany: {
                        where: { pollId: poll.id },
                        data: {
                          unused: true,
                          movieId: null,
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
      )
      .then(async (data) => {
        await fastify.redisClient.del(`poll-${poll.id}`);
        return data;
      });

export const removePoll =
  (fastify: FastifyInstance) =>
  (userSession: UserSession, pollId: Poll['id']) =>
    fastify.prismaClient
      .$transaction(
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
      )
      .then(async (data) => {
        // TODO: instead of deleting the key update it to a value that
        // mark the key as deleted
        await fastify.redisClient.del(`poll-${data.id}`);
        return data;
      });

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
            _count: {
              select: {
                VotingToken: true,
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

        if (currentPoll._count.VotingToken + amount > 50)
          throw new Error('LIMIT_REACHED');

        return tx.poll.update({
          where: {
            id: pollId,
          },
          data: {
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

        if (!votingToken)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'VotingToken not found.',
          });

        return tx.votingToken.delete({
          where: {
            id_pollId: {
              id: votingToken.id,
              pollId,
            },
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
