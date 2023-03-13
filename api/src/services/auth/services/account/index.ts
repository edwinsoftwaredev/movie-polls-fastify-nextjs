import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import privateRoutes from './plugins/private-routes';
import routes from './plugins/routes';
import user from './plugins/user';

const account: FastifyPluginAsync = async (fastify) => {
  fastify.register(user);
  fastify.register(routes, { prefix: '/trpc/accountRoutes' });
  fastify.register(privateRoutes, { prefix: '/trpc/privateAccountRoutes' });
};

export default fastifyPlugin(account);
