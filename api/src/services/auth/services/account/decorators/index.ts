import {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
  PutCommand,
  QueryCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { TRPCError } from '@trpc/server';

import { FastifyInstance } from 'fastify';
import { BaseUser, UserSession } from 'app-types';

const getUserPolls = (fastify: FastifyInstance, userId: string) =>
  DynamoDBDocumentClient.from(fastify.dynamoDBClient)
    .send(
      new QueryCommand({
        TableName: fastify.vars.usersTable,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `${userId}#polls`,
        },
        ProjectionExpression: 'id',
      })
    )
    .then((output) => (output.Items || []) as Array<{ id: string }>)
    .catch((_) => {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    });

const getPollVotingTokens = (fastify: FastifyInstance, pollId: string) =>
  DynamoDBDocumentClient.from(fastify.dynamoDBClient)
    .send(
      new QueryCommand({
        TableName: fastify.vars.PollsVotingTokenTable,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': pollId,
        },
        ProjectionExpression: 'id',
      })
    )
    .then((output) => (output.Items || []) as Array<{ id: string }>)
    .catch((_) => {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    });

// TODO: exception handling
export const getUser = (fastify: FastifyInstance) => async (user: string) =>
  DynamoDBDocumentClient.from(fastify.dynamoDBClient)
    .send(
      new GetCommand({
        TableName: fastify.vars.usersTable,
        Key: { PK: `${user}`, SK: 'metadata' },
        ProjectionExpression: 'email,displayName,picture,id,emailVerified',
        ConsistentRead: true,
      })
    )
    .then((result) => (result.Item || null) as BaseUser | null)
    .catch((_) => {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    });

export const deleteAccount =
  (fastify: FastifyInstance) => async (userSession: UserSession) => {
    const polls = await getUserPolls(fastify, userSession.userId || '');

    if (polls.length) {
      await DynamoDBDocumentClient.from(fastify.dynamoDBClient)
        .send(
          new TransactWriteCommand({
            TransactItems: polls.map((poll) => ({
              Delete: {
                TableName: fastify.vars.usersTable,
                Key: { PK: `${userSession.userId}#polls`, SK: poll.id },
              },
            })),
          })
        )
        .catch((_) => {
          throw new TRPCError({ code: 'BAD_REQUEST' });
        });
    }

    await Promise.all(
      polls.map(async (poll) => {
        const tokens = await getPollVotingTokens(fastify, poll.id);
        if (tokens.length) {
          await DynamoDBDocumentClient.from(fastify.dynamoDBClient)
            .send(
              new TransactWriteCommand({
                TransactItems: tokens.map((token) => ({
                  Delete: {
                    TableName: fastify.vars.PollsVotingTokenTable,
                    Key: { PK: poll.id, SK: token.id },
                  },
                })),
              })
            )
            .catch((_) => {
              throw new TRPCError({ code: 'BAD_REQUEST' });
            });
        }
      })
    );

    return DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Delete: {
                TableName: fastify.vars.usersTable,
                Key: { PK: userSession.userId!, SK: 'metadata' },
              },
            },
            {
              Delete: {
                TableName: fastify.vars.usersTable,
                Key: { PK: userSession.userId, SK: 'pollCount' },
              },
            },
          ],
        })
      )
      .then((_) => ({ id: userSession.userId! }))
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });
  };

export const createUser =
  (fastify: FastifyInstance) =>
  async (
    userId: string,
    displayName: string,
    provider: string,
    email: string,
    emailVerified: boolean,
    picture: string
  ) =>
    DynamoDBDocumentClient.from(fastify.dynamoDBClient)
      .send(
        new PutCommand({
          TableName: fastify.vars.usersTable,
          Item: {
            PK: `${userId}`,
            SK: 'metadata',
            id: userId,
            displayName: displayName,
            provider: provider,
            email: email,
            emailVerified: emailVerified,
            picture: picture,
          },
        })
      )
      .then((output) => output.Attributes || null)
      .catch((_) => {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      });

export type GetUser = ReturnType<typeof getUser>;
export type DeleteAccount = ReturnType<typeof deleteAccount>;
export type CreateUser = ReturnType<typeof createUser>;
