import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { getUser } from '../decorators';

const user: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('account', {
    ...fastify.account,
    user: { getUser: getUser(fastify) },
  });
};

export default fastifyPlugin(user);
