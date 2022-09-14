import { FastifyInstance } from "fastify";

const routes = async (fastify: FastifyInstance, options: Object) => {
  fastify.get('csrf-token', (req, rep) => {
  });
};

export default routes;