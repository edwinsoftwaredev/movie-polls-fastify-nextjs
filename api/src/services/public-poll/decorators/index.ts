import { MoviePoll, Poll, Prisma, VotingToken } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { FastifyInstance } from 'fastify';

export const getPoll =
  (fastify: FastifyInstance) => async (pollId: Poll['id']) => {
    const result = await fastify.prismaClient.poll.findUniqueOrThrow({
      where: {
        id: pollId,
      },
      select: {
        id: true,
        name: true,
        author: {
          select: {
            displayName: true,
            picture: true,
          },
        },
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
        isActive: true,
        expiresOn: true,
      },
    });

    const { VotingToken, ...rest } = result;

    return {
      ...rest,
      votingTokenCount: VotingToken.length,
      remainingVotingTokenCount: VotingToken.filter((vt) => vt.unused === true)
        .length,
    };
  };

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
              MoviePoll: {
                where: {
                  movieId,
                  pollId,
                },
              },
              VotingToken: {
                where: {
                  id: votingTokenId,
                  pollId,
                },
              },
            },
          });

          if (
            !currentPoll.MoviePoll.at(0) ||
            !currentPoll.VotingToken.at(0) ||
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
                id: currentPoll.VotingToken.at(0)!.id,
                pollId,
              },
            },
            data: {
              unused: false,
              movieId: currentPoll.MoviePoll.at(0)!.movieId,
            },
            select: {
              id: true,
              pollId: true,
              movieId: true,
              unused: true,
            },
          });
        },
        { isolationLevel: 'Serializable' }
      )
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
