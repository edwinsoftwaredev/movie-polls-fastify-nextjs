import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import user from './plugins/user';

const account: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(user);
};

export default fastifyPlugin(account);
