import { FastifyPluginAsync } from 'fastify';
import dynamoDBClient from './dynamodb-client';
import { poll } from '../services';

const pollPlugin: FastifyPluginAsync = async (fastify) => {
  const accessKeyId = process.env.DYNAMODB_ACCESS_KEY || '';
  const secretAccessKey = process.env.DYNAMODB_SECRET_ACCESS_KEY || '';

  fastify.register(dynamoDBClient, { accessKeyId, secretAccessKey });
  fastify.register(poll);
};

export default pollPlugin;
