import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { deleteAccount, getUser, createUser } from '../decorators';

const user: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('account', {
    ...fastify.account,
    user: {
      getUser: getUser(fastify),
      deleteAccount: deleteAccount(fastify),
      createUser: createUser(fastify),
    },
  });
};

export default fastifyPlugin(user);
