import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

interface DynamoDBClientPluginOptions extends FastifyPluginOptions {
  accessKeyId: string;
  secretAccessKey: string;
}

const dynamoDBClient: FastifyPluginAsync<DynamoDBClientPluginOptions> = async (
  fastify,
  opts
) => {
  const { accessKeyId, secretAccessKey } = opts;

  // TODO: Add setup params
  const client = new DynamoDBClient({
    credentials: { accessKeyId, secretAccessKey },
  });

  fastify.log.info('dynamoDBClient client configured.');
  fastify.decorate('dynamoDBClient', client);
  fastify.decorate('vars', {
    usersTable: 'users',
    PollsVotingTokenTable: 'votingtokens',
  });
};

export default fastifyPlugin(dynamoDBClient);
