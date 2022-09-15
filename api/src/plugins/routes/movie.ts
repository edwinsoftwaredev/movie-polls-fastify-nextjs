import { FastifyInstance } from 'fastify';

const routes = (fastify: FastifyInstance, options: Object) => {
  fastify.get('/', async (request, reply) => {
    return { hello: 'world test' };
  });
}

export default routes;
