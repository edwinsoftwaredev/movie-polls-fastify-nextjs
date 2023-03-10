import { MoviePoll, Poll, Prisma, VotingToken } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { FastifyInstance } from 'fastify';

export const getPoll =
  (fastify: FastifyInstance) => async (pollId: Poll['id']) =>
    fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: pollId,
      },
      select: {
        id: true,
        name: true,
        remainingVotingTokenCount: true,
        votingTokenCount: true,
        author: {
          select: {
            displayName: true,
            picture: true,
          },
        },
        MoviePoll: true,
        isActive: true,
        expiresOn: true,
      },
    });

export const getVotingToken =
  (fastify: FastifyInstance) =>
  async (pollId: Poll['id'], votingTokenId: VotingToken['id']) =>
    fastify.prismaClient.votingToken.findUniqueOrThrow({
      where: {
        id_pollId: {
          id: votingTokenId,
          pollId: pollId,
        },
      },
      select: {
        id: true,
        pollId: true,
        unused: true,
      },
    });

export const voteHandler =
  (fastify: FastifyInstance) =>
  async (
    pollId: Poll['id'],
    votingTokenId: VotingToken['id'],
    movieId: MoviePoll['movieId']
  ) =>
    fastify.prismaClient
      .$transaction(
        async (tx) => {
          const currentPoll = await tx.poll.findUniqueOrThrow({
            where: {
              id: pollId,
            },
            select: {
              expiresOn: true,
              isActive: true,
              VotingToken: {
                where: {
                  id: votingTokenId,
                  pollId,
                },
                select: {
                  unused: true,
                },
              },
            },
          });

          if (
            !currentPoll.isActive ||
            !currentPoll.expiresOn ||
            currentPoll.VotingToken.at(0)?.unused === false
          )
            throw new TRPCError({ code: 'UNAUTHORIZED' });

          if (currentPoll.expiresOn < new Date())
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Poll is expired.',
            });

          return tx.votingToken.update({
            where: {
              id_pollId: {
                id: votingTokenId,
                pollId,
              },
            },
            data: {
              unused: false,
            },
            select: {
              id: true,
              pollId: true,
              unused: true,
            },
          });
        },
        { isolationLevel: 'Serializable' }
      )
      .then(async (vt) => {
        await fastify.prismaClient.poll.update({
          where: {
            id: pollId,
          },
          data: {
            remainingVotingTokenCount: {
              decrement: 1,
            },
            MoviePoll: {
              update: {
                where: {
                  pollId_movieId: {
                    pollId: pollId,
                    movieId: movieId,
                  },
                },
                data: {
                  voteCount: {
                    increment: 1,
                  },
                  VotingToken: {
                    connect: {
                      id_pollId: {
                        id: votingTokenId,
                        pollId,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        return vt;
      })
      .catch((err) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === 'P2034') {
            throw new TRPCError({
              code: 'CONFLICT',
              cause: {
                errorCode: 'P2034',
              },
            });
          }
        }

        throw err;
      });

export type GetPoll = ReturnType<typeof getPoll>;
export type GetVotingToken = ReturnType<typeof getVotingToken>;
export type VoteHandler = ReturnType<typeof voteHandler>;
