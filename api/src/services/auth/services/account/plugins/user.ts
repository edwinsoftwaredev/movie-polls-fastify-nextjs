import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { deleteAccount, getUser } from '../decorators';

const user: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('account', {
    ...fastify.account,
    user: {
      getUser: getUser(fastify),
      deleteAccount: deleteAccount(fastify),
    },
  });
};

export default fastifyPlugin(user);
