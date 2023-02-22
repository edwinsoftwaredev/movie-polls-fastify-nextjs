import { FastifyPluginAsync } from 'fastify';
import { movies } from '../services';

const moviePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(movies);
};

export default moviePlugin;
