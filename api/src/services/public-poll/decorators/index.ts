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
          const currentVotingToken = await tx.votingToken.findFirstOrThrow({
            where: {
              id: votingTokenId,
              pollId: pollId,
              unused: true,
              movieId: null,
            },
            select: {
              id: true,
              poll: true,
            },
          });

          if (
            !currentVotingToken.poll.isActive ||
            !currentVotingToken.poll.expiresOn
          )
            throw new TRPCError({ code: 'UNAUTHORIZED' });

          if (currentVotingToken.poll.expiresOn < new Date())
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Poll is expired.',
            });

          return tx.votingToken.update({
            where: {
              id_pollId: {
                id: currentVotingToken.id,
                pollId,
              },
            },
            data: {
              unused: false,
              movieId: movieId,
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
