import { TRPCError } from '@trpc/server';
import { FastifyInstance } from 'fastify';
import { Movie } from '../../../../src/services/public-movies/types';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import { Poll, UserSession, VotingToken } from 'app-types';

const getAuthor = (fastify: FastifyInstance, userSession: UserSession) =>
  DynamoDBDocumentClient.from(fastify.dynamoDBClient)
    .send(
      new GetCommand({
        TableName: fastify.vars.usersTable,
        Key: { PK: userSession.userId, SK: 'metadata' },
        ProjectionExpression: 'displayName, picture, id',
      })
    )
    .then((output) => {
      if (!output.Item) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return output.Item as {
        displayName: string;
        picture: string;
        id: string;
      };
    })
    .catch((_) => {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    });

const getPolls = (
  fastify: FastifyInstance,
  userSession: UserSession,
  isActive?: boolean,
  pollId?: string
) =>
  DynamoDBDocumentClient.from(fastify.dynamoDBClient)
    .send(
      new QueryCommand({
        TableName: fastify.vars.usersTable,
        KeyConditionExpression: 'PK = :pk' + (pollId ? ' AND SK = :sk' : ''),
        ...(typeof isActive !== 'undefined'
          ? { FilterExpression: 'isActive = :v_isActive' }
          : {}),
        ExpressionAttributeValues: {
          ':pk': `${userSession.userId}#polls`,
          ...(pollId ? { ':sk': `${pollId || ''}` } : {}),
          ...(typeof isActive !== 'undefined'
            ? { ':v_isActive': isActive }
            : {}),
        },
        ProjectionExpression:
          'createdAt, id, expiresOn, isActive, #name, movies',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
      })
    )
    .then((output) => (output.Items || []).map((item) => item as Poll))
    .catch((_) => {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    });

const getMoviePollCount = async (
  fastify: FastifyInstance,
  polls: Array<Poll>
) => {
  const obj: {
    [key: string]: Array<{
      total: number;
      movieId: number;
      pollId: string;
      _count: { VotingToken: number };
    }>;
  } = {};

  // NOTE: 50 polls x 5 movies = 250 req
  await Promise.all(
    polls.map(async (poll) => {
      obj[poll.id] = await Promise.all(
        Array.from(poll.movies).map((movie) =>
          DynamoDBDocumentClient.from(fastify.dynamoDBClient)
            .send(
              new QueryCommand({
                TableName: fastify.vars.PollsVotingTokenTable,
                KeyConditionExpression: 'PK = :pk',
                FilterExpression: 'movieId = :movie',
                ExpressionAttributeValues: {
                  ':pk': poll.id,
                  ':movie': movie,
                },
                Select: 'COUNT',
              })
            )
            .then((output) => ({
              total: output.ScannedCount || 0,
              movieId: movie,
              pollId: poll.id,
              _count: {
                VotingToken: output.Count || 0,
              },
            }))
            .catch((_) => {
              throw new TRPCError({ code: 'BAD_REQUEST' });
            })
        )
      );
    })
  );

  return obj;
};

const mergeAuthorPoll = (
  author: Awaited<ReturnType<typeof getAuthor>>,
  polls: Array<Poll>,
  moviePolls: Awaited<ReturnType<typeof getMoviePollCount>>
) =>
  polls.map((poll) => ({
    author: author,
    id: poll.id,
    name: poll.name,
    expiresOn: poll.expiresOn,
    createdAt: poll.createdAt,
    isActive: poll.isActive,
    movies: Array.from(poll.movies),
    votingTokenCount: moviePolls[poll.id][0].total,
    remainingVotingTokenCount: moviePolls[poll.id].reduce(
      (prev, cur) => prev - cur._count.VotingToken,
      moviePolls[poll.id][0].total
    ),
    MoviePoll: moviePolls[poll.id].map((item) => ({
      movieId: item.movieId,
      _count: item._count,
      pollId: item.pollId,
    })),
  }));

const getPollVotingTokens = (fastify: FastifyInstance, poll: string) =>
  DynamoDBDocumentClient.from(fastify.dynamoDBClient)
    .send(
      new QueryCommand({
        TableName: fastify.vars.PollsVotingTokenTable,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': poll,
        },
        ProjectionExpression: 'id',
      })
    )
    .then((output) => (output.Items || []) as Array<{ id: string }>)
    .catch((_) => {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    });

export const getInactivePolls =
  (fastify: FastifyInstance) => async (userSession: UserSession) => {
    const author = await getAuthor(fastify, userSession);
    const polls = await getPolls(fastify, userSession, false);
    const moviePollCount = await getMoviePollCount(fastify, polls);
    return mergeAuthorPoll(author, polls, moviePollCount);
  };

export const getActivePolls =
  (fastify: FastifyInstance) => async (userSession: UserSession) => {
    const author = await getAuthor(fastify, userSession);
    const polls = await getPolls(fastify, userSession, true);
    const moviePollCount = await getMoviePollCount(fastify, polls);
    return mergeAuthorPoll(author, polls, moviePollCount);
  };

export const createPoll =
  (fastify: FastifyInstance) =>
  async (userSession: UserSession, pollName: string, movieId: Movie['id']) => {
    const poll = randomUUID();
    const now = new Date();
    await DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: fastify.vars.usersTable,
                Item: {
                  PK: `${userSession.userId}#polls`,
                  SK: `${poll}`,
                  id: `${poll}`,
                  name: pollName,
                  createdAt: now.toISOString(),
                  isActive: false,
                  expiresOn: null,
                  movies: new Set([movieId]),
                  votingTokenCount: 0,
                },
              },
            },
            {
              Update: {
                TableName: fastify.vars.usersTable,
                Key: { PK: `${userSession.userId}`, SK: 'pollCount' },
                ConditionExpression:
                  'attribute_not_exists(pollCount) OR pollCount < :checkval',
                UpdateExpression:
                  'SET pollCount = if_not_exists(pollCount, :initval) + :incval',
                ExpressionAttributeValues: {
                  ':initval': 0,
                  ':incval': 1,
                  ':checkval': 50,
                },
              },
            },
          ],
        })
      )
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

    return {
      MoviePoll: [{ pollId: poll, movieId: movieId }],
      id: poll,
      name: pollName,
      createdAt: now,
      expiresOn: null,
      isActive: false,
      movies: [movieId],
      author: {
        id: userSession.userId,
      },
    };
  };

export const getPoll =
  (fastify: FastifyInstance) =>
  async (userSession: UserSession, pollId: Poll['id']) => {
    const author = await getAuthor(fastify, userSession);
    const polls = await getPolls(fastify, userSession, undefined, pollId);
    const moviePolls = await getMoviePollCount(fastify, polls);
    return mergeAuthorPoll(author, polls, moviePolls)[0];
  };

export const updatePoll =
  (fastify: FastifyInstance) =>
  async (userSession: UserSession, poll: Omit<Poll, 'createdAt'>) => {
    if (poll.isActive) {
      if (!poll.expiresOn) throw new Error('INVALID_DATE');
      poll.expiresOn = new Date(poll.expiresOn);
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 28);
      if (poll.expiresOn > maxDate) throw new Error('INVALID_DATE');
    }

    const updateOps = (await getPollVotingTokens(fastify, poll.id)).map(
      (item) => ({
        Update: {
          TableName: fastify.vars.PollsVotingTokenTable,
          Key: { PK: poll.id, SK: item.id },
          UpdateExpression: 'SET movieId = :nullval, unused = :trueval',
          ExpressionAttributeValues: {
            ':nullval': null,
            ':trueval': true,
          },
        },
      })
    );

    await DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: {
                TableName: fastify.vars.usersTable,
                Key: { PK: `${userSession.userId}#polls`, SK: poll.id },
                ConditionExpression:
                  'isActive = :falseval OR (isActive = :trueval AND isActive <> :isActiveArg AND attribute_type(expiresOn, :stringtype) AND expiresOn > :now)',
                UpdateExpression:
                  'SET isActive = :isActiveArg, #name = :pollname, expiresOn = :expiresOnArg',
                ExpressionAttributeValues: {
                  ':isActiveArg': poll.isActive,
                  ':pollname': poll.name,
                  ':expiresOnArg': !poll.isActive
                    ? null
                    : poll.expiresOn!.toISOString(),
                  ':falseval': false,
                  ':trueval': true,
                  ':stringtype': 'S',
                  ':now': new Date().toISOString(),
                },
                ExpressionAttributeNames: {
                  '#name': 'name',
                },
              },
            },
            ...updateOps,
          ],
        })
      )
      .then(async (_) => {
        await fastify.redisClient.del(`poll-${poll.id}`);
      })
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

    return DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new GetCommand({
          TableName: fastify.vars.usersTable,
          Key: { PK: `${userSession.userId}#polls`, SK: poll.id },
          ProjectionExpression: 'id,#name,createdAt,expiresOn,isActive',
          ExpressionAttributeNames: {
            '#name': 'name',
          },
        })
      )
      .then((output) => {
        if (!output.Item) throw new TRPCError({ code: 'BAD_REQUEST' });
        return {
          ...(output.Item as Poll),
          author: {
            id: userSession.userId,
          },
        };
      })
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });
  };

export const removePoll =
  (fastify: FastifyInstance) =>
  async (userSession: UserSession, pollId: Poll['id']) => {
    const deleteOps = (await getPollVotingTokens(fastify, pollId)).map(
      (item) => ({
        Delete: {
          TableName: fastify.vars.PollsVotingTokenTable,
          Key: { PK: pollId, SK: item.id },
        },
      })
    );

    const poll = await DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new GetCommand({
          TableName: fastify.vars.usersTable,
          Key: { PK: `${userSession.userId}#polls`, SK: pollId },
        })
      )
      .then((output) => output.Item as Poll);

    return DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new TransactWriteCommand({
          ClientRequestToken: pollId,
          TransactItems: [
            {
              Delete: {
                TableName: fastify.vars.usersTable,
                Key: { PK: `${userSession.userId}#polls`, SK: pollId },
                ConditionExpression: 'PK = :pk',
                ExpressionAttributeValues: {
                  ':pk': `${userSession.userId}#polls`,
                },
              },
            },
            ...deleteOps,
            {
              Update: {
                TableName: fastify.vars.usersTable,
                Key: { PK: `${userSession.userId}`, SK: 'pollCount' },
                UpdateExpression: 'SET pollCount = pollCount - :val',
                ExpressionAttributeValues: {
                  ':val': 1,
                },
              },
            },
          ],
        })
      )
      .then(async (_) => {
        await fastify.redisClient.del(`poll-${pollId}`);
        return poll;
      })
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });
  };

export const addMovie =
  (fastify: FastifyInstance) =>
  async (userSession: UserSession, pollId: Poll['id'], movieId: Movie['id']) =>
    DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: {
                TableName: fastify.vars.usersTable,
                Key: { PK: `${userSession.userId}#polls`, SK: pollId },
                ConditionExpression:
                  'isActive = :falseval AND size(movies) < :val',
                UpdateExpression: 'ADD movies :movie',
                ExpressionAttributeValues: {
                  ':movie': new Set([movieId]),
                  ':falseval': false,
                  ':val': 5,
                },
              },
            },
          ],
        })
      )
      .then((_) => ({ pollId: pollId, movieId: movieId }))
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

export const removeMovie =
  (fastify: FastifyInstance) =>
  (userSession: UserSession, pollId: Poll['id'], movieId: Movie['id']) =>
    DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: {
                TableName: fastify.vars.usersTable,
                Key: { PK: `${userSession.userId}#polls`, SK: pollId },
                ConditionExpression:
                  'isActive = :falseval AND size(movies) > :val',
                UpdateExpression: 'DELETE movies :movie',
                ExpressionAttributeValues: {
                  ':movie': new Set([movieId]),
                  ':falseval': false,
                  ':val': 1,
                },
              },
            },
          ],
        })
      )
      .then((_) => ({ pollId: pollId, movieId: movieId }))
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

export const addVotingTokens =
  (fastify: FastifyInstance) =>
  async (userSession: UserSession, pollId: Poll['id'], amount: number = 1) => {
    if (amount < 1) throw new Error('LIMIT_REACHED');

    const now = new Date().toISOString();
    const ops = Array.from({ length: amount }, () => {
      const id = randomUUID();
      return {
        Put: {
          TableName: fastify.vars.PollsVotingTokenTable,
          Item: {
            PK: pollId,
            SK: `${id}`,
            id: id,
            label: '',
            unused: true,
            unshared: true,
            createdAt: now,
            pollId: pollId,
            movieId: null,
            authorId: userSession.userId,
          },
        },
      };
    });

    await DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new TransactWriteCommand({
          TransactItems: [
            ...ops,
            {
              Update: {
                TableName: fastify.vars.usersTable,
                Key: { PK: `${userSession.userId}#polls`, SK: pollId },
                ConditionExpression:
                  'isActive = :falseval AND (attribute_not_exists(votingTokenCount) OR (votingTokenCount <= :val))',
                UpdateExpression:
                  'SET votingTokenCount = if_not_exists(votingTokenCount, :initval) + :v_amount',
                ExpressionAttributeValues: {
                  ':initval': 0,
                  ':v_amount': amount,
                  ':falseval': false,
                  ':val': 50 - amount,
                },
              },
            },
          ],
        })
      )
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

    return DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new QueryCommand({
          TableName: fastify.vars.PollsVotingTokenTable,
          KeyConditionExpression: 'PK = :pk',
          ExpressionAttributeValues: {
            ':pk': pollId,
          },
        })
      )
      .then((output) => ({
        id: pollId,
        VotingToken: (output.Items || []) as Array<VotingToken>,
      }))
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });
  };

export const getVotingTokens =
  (fastify: FastifyInstance) =>
  async (userSession: UserSession, pollId: Poll['id']) => {
    await DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new GetCommand({
          TableName: fastify.vars.usersTable,
          Key: { PK: `${userSession.userId}#polls`, SK: `${pollId}` },
          ProjectionExpression: 'id',
        })
      )
      .catch((_) => {
        throw new Error('UNAUTHORIZED');
      });

    return DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new QueryCommand({
          TableName: fastify.vars.PollsVotingTokenTable,
          KeyConditionExpression: 'PK = :pk',
          ExpressionAttributeValues: {
            ':pk': pollId,
          },
          ProjectionExpression:
            'id,pollId,movieId,label,unshared,unused,createdAt',
        })
      )
      .then((output) =>
        ((output.Items || []) as Array<VotingToken>).map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }))
      )
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });
  };

export const updateVotingToken =
  (fastify: FastifyInstance) =>
  (userSession: UserSession, votingToken: VotingToken) =>
    DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new TransactWriteCommand({
          TransactItems: [
            {
              ConditionCheck: {
                TableName: fastify.vars.usersTable,
                Key: {
                  PK: `${userSession.userId}#polls`,
                  SK: `${votingToken.pollId}`,
                },
                ConditionExpression:
                  'attribute_type(expiresOn, :nulltype) OR expiresOn > :now',
                ExpressionAttributeValues: {
                  ':nulltype': 'NULL',
                  ':now': new Date().toISOString(),
                },
              },
            },
            {
              Update: {
                TableName: fastify.vars.PollsVotingTokenTable,
                Key: {
                  PK: `${votingToken.pollId}`,
                  SK: `${votingToken.id}`,
                },
                UpdateExpression:
                  'SET label = :v_label, unshared = :v_unshared',
                ExpressionAttributeValues: {
                  ':v_label': votingToken.label,
                  ':v_unshared': votingToken.unshared,
                },
              },
            },
          ],
        })
      )
      .then(
        (_) =>
          ({
            id: votingToken.id,
            pollId: votingToken.pollId,
            label: votingToken.label || '',
            unused:
              typeof votingToken.unused === 'undefined'
                ? true
                : votingToken.unused,
            unshared: votingToken.unshared,
          } as VotingToken)
      )
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

export const removeVotingToken =
  (fastify: FastifyInstance) =>
  (
    userSession: UserSession,
    pollId: Poll['id'],
    votingTokenId: VotingToken['id']
  ) =>
    DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new TransactWriteCommand({
          ClientRequestToken: votingTokenId,
          TransactItems: [
            {
              Update: {
                TableName: fastify.vars.usersTable,
                Key: {
                  PK: `${userSession.userId}#polls`,
                  SK: `${pollId}`,
                },
                ConditionExpression: 'isActive = :v_isActive',
                UpdateExpression:
                  'SET votingTokenCount = votingTokenCount - :val',
                ExpressionAttributeValues: {
                  ':v_isActive': false,
                  ':val': 1,
                },
              },
            },
            {
              Delete: {
                TableName: fastify.vars.PollsVotingTokenTable,
                Key: {
                  PK: pollId,
                  SK: votingTokenId,
                },
              },
            },
          ],
        })
      )
      .then((_) => ({ pollId: pollId, id: votingTokenId } as VotingToken))
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

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
