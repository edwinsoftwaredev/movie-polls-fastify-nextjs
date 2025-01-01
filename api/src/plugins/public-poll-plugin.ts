import { FastifyPluginAsync } from 'fastify';
import dynamoDBClient from './dynamodb-client';
import { publicPoll } from '../services';

const publicPollPlugin: FastifyPluginAsync = async (fastify) => {
  const accessKeyId = process.env.DYNAMODB_ACCESS_KEY || '';
  const secretAccessKey = process.env.DYNAMODB_SECRET_ACCESS_KEY || '';

  fastify.register(dynamoDBClient, { accessKeyId, secretAccessKey });
  fastify.register(publicPoll);
};

export default publicPollPlugin;
