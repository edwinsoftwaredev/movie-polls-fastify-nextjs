import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { TRPCError } from '@trpc/server';
import { FastifyInstance } from 'fastify';
import { MoviePoll, Poll, VotingToken } from 'app-types';

type PollVM = Omit<Poll, 'createdAt'> & {
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

    const author = await DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new QueryCommand({
          TableName: fastify.vars.PollsVotingTokenTable,
          KeyConditionExpression: 'PK = :poll',
          ExpressionAttributeValues: {
            ':poll': pollId,
          },
          ProjectionExpression: 'authorId',
          Limit: 1,
        })
      )
      .then((output) => output.Items as [{ authorId: string }] | undefined)
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

    if (!author || !author.length) throw new TRPCError({ code: 'NOT_FOUND' });

    const userAuthor = await DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new GetCommand({
          TableName: fastify.vars.usersTable,
          Key: { PK: author[0].authorId, SK: 'metadata' },
          ProjectionExpression: 'displayName,picture',
        })
      )
      .then((output) => {
        if (!output.Item)
          throw new TRPCError({
            code: 'UNAUTHORIZED',
          });
        return {
          displayName: output.Item.displayName,
          picture: output.Item.picture,
        };
      })
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

    const poll = await DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new GetCommand({
          TableName: fastify.vars.usersTable,
          Key: { PK: `${author[0].authorId}#polls`, SK: pollId },
          ProjectionExpression: 'id,#name,isActive,movies,expiresOn,createdAt',
          ExpressionAttributeNames: {
            '#name': 'name',
          },
        })
      )
      .then((output) => {
        if (!output.Item) throw new TRPCError({ code: 'BAD_REQUEST' });
        return output.Item as Poll;
      })
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

    const pollVotes = await Promise.all(
      Array.from(poll.movies).map((movie) =>
        DynamoDBDocumentClient.from(fastify.dynamoDBClient)
          .send(
            new QueryCommand({
              TableName: fastify.vars.PollsVotingTokenTable,
              KeyConditionExpression: 'PK = :pollId',
              FilterExpression: '#movieId = :movieId',
              ExpressionAttributeNames: {
                '#movieId': 'movieId',
              },
              ExpressionAttributeValues: {
                ':pollId': pollId,
                ':movieId': movie,
              },
              Select: 'COUNT',
              ConsistentRead: false,
            })
          )
          .then((output) => ({
            total: output.ScannedCount || 0,
            votes: output.Count || 0,
            movie: movie,
          }))
          .catch((_) => {
            throw new TRPCError({ code: 'BAD_REQUEST' });
          })
      )
    );

    const votingTokenCount = pollVotes[0].total;
    const remainingVotingTokenCount = pollVotes.reduce(
      (rem, item) => rem - item.votes,
      votingTokenCount
    );

    const pollR = {
      id: poll.id,
      name: poll.name,
      expiresOn: poll.expiresOn,
      isActive: poll.isActive,
      createdAt: poll.createdAt,
      author: userAuthor,
      MoviePoll: pollVotes.map((item) => ({
        movieId: item.movie,
        pollId: pollId,
        _count: { VotingToken: item.votes },
      })),
      votingTokenCount,
      remainingVotingTokenCount,
    };

    // TODO: Add typed decorators for adding and removing polls to redisClient
    // PollsVM are visible to any user and must not include sensitive values/properties
    fastify.redisClient.set(`poll-${pollR.id}`, pollR, { ex: 300 });

    return pollR;
  };

export const getVotingToken =
  (fastify: FastifyInstance) =>
  async (pollId: Poll['id'], votingTokenId: VotingToken['id']) =>
    DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new GetCommand({
          TableName: fastify.vars.PollsVotingTokenTable,
          Key: {
            PK: pollId,
            SK: votingTokenId,
          },
          ProjectionExpression: 'id,pollId,movieId,unused',
          ConsistentRead: false,
        })
      )
      .then((output) => {
        if (!output.Item) throw new TRPCError({ code: 'BAD_REQUEST' });
        return output.Item as VotingToken;
      })
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

export const voteHandler =
  (fastify: FastifyInstance) =>
  async (
    pollId: Poll['id'],
    votingTokenId: VotingToken['id'],
    movieId: MoviePoll['movieId']
  ) => {
    const author = await DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new QueryCommand({
          TableName: fastify.vars.PollsVotingTokenTable,
          KeyConditionExpression: 'PK = :poll',
          ExpressionAttributeValues: {
            ':poll': pollId,
          },
          Limit: 1,
          ProjectionExpression: 'authorId',
        })
      )
      .then((output) => output.Items as [{ authorId: string }] | undefined)
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

    if (!author || !author.length) throw new TRPCError({ code: 'BAD_REQUEST' });

    const user = author[0].authorId;

    await DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new TransactWriteCommand({
          ClientRequestToken: votingTokenId,
          TransactItems: [
            {
              ConditionCheck: {
                TableName: fastify.vars.usersTable,
                Key: { PK: `${user}#polls`, SK: `${pollId}` },
                ConditionExpression:
                  'isActive = :trueval AND (attribute_type(expiresOn, :stringtype) AND expiresOn > :datenow) AND contains(movies, :movie)',

                ExpressionAttributeValues: {
                  ':trueval': true,
                  ':stringtype': 'S',
                  ':datenow': new Date().toISOString(),
                  ':movie': movieId,
                },
              },
            },
            {
              Update: {
                TableName: fastify.vars.PollsVotingTokenTable,
                Key: { PK: pollId, SK: votingTokenId },
                ConditionExpression:
                  'attribute_type(movieId, :nulltype) AND #unused = :trueval',
                UpdateExpression:
                  'SET #movieId = :v_movieId, #unused = :falseval',
                ExpressionAttributeNames: {
                  '#movieId': 'movieId',
                  '#unused': 'unused',
                },
                ExpressionAttributeValues: {
                  ':v_movieId': movieId,
                  ':nulltype': 'NULL',
                  ':trueval': true,
                  ':falseval': false,
                },
              },
            },
          ],
        })
      )
      .catch((e) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

    await fastify.redisClient.del(`poll-${pollId}`);

    return {
      id: votingTokenId,
      pollId: pollId,
      movieId: movieId,
      unused: false,
    };
  };

export type GetPoll = ReturnType<typeof getPoll>;
export type GetVotingToken = ReturnType<typeof getVotingToken>;
export type VoteHandler = ReturnType<typeof voteHandler>;
