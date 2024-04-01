import { MoviePoll, Poll, Prisma, VotingToken } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { FastifyInstance } from 'fastify';

type PollVM = Omit<Poll, 'createdAt' | 'authorId'> & {
  votingTokenCount: number;
  remainingVotingTokenCount: number;
  author: {
    displayName: string;
    picture: string | null;
  };
  MoviePoll: {
    _count: {
      VotingToken: number;
    };
    pollId: string;
    movieId: number;
  }[];
};

export const getPoll =
  (fastify: FastifyInstance) => async (pollId: Poll['id']) => {
    const cachedPoll = await fastify.redisClient.get<PollVM>(`poll-${pollId}`);

    // TODO: handle polls in cache that already expired
    if (cachedPoll) return cachedPoll;

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

    const poll = {
      ...rest,
      votingTokenCount: VotingToken.length,
      remainingVotingTokenCount: VotingToken.filter((vt) => vt.unused).length,
    };

    // TODO: Add typed decorators for adding and removing polls to redisClient
    // PollsVM are visible to any user and must not include sensitive values/properties
    fastify.redisClient.set<PollVM>(`poll-${poll.id}`, poll, { ex: 300 });

    return poll;
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
      .then(async (vote) => {
        // For every write there will be one read.
        // In a burst of traffic this might not be optimal.
        await fastify.redisClient.del(`poll-${vote.pollId}`);
        return vote;
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
