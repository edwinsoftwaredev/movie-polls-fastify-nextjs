import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import * as Passport from 'passport';

interface PassportPluginsOpts extends FastifyPluginOptions {}

const passport: FastifyPluginAsync<PassportPluginsOpts> = async (
  fastify,
  opts
) => {
  fastify.decorate('passport', Passport);
};

export default fastifyPlugin(passport);
