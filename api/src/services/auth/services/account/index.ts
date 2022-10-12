import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import routes from './plugins/routes';
import user from './plugins/user';

const account: FastifyPluginAsync = async (fastify) => {
  fastify.register(user);
  fastify.register(routes, { prefix: '/trpc/accountRoutes' });
};

export default fastifyPlugin(account);
