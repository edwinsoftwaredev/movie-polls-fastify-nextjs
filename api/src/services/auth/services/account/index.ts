import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

const account: FastifyPluginAsync = async (fastify, opts) => {};

export default fastifyPlugin(account);
