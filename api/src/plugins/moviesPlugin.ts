import { FastifyPluginAsync } from 'fastify';
import { movies } from '../services';
import prismaClient from './prismaClient';

const moviesPlugin: FastifyPluginAsync = async (fastify) => {
  const databaseUrl = process.env.DATABASE_URL || '';

  fastify.register(prismaClient, { databaseUrl });
  fastify.register(movies);
};

export default moviesPlugin;
