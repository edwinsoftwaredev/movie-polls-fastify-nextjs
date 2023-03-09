import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { getPoll, getVotingToken, voteHandler } from './decorators';
import routes from './plugins/routes';

const publicPoll: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('publicPolls', {
    getPoll: getPoll(fastify),
    getVotingToken: getVotingToken(fastify),
    voteHandler: voteHandler(fastify),
  });

  fastify.register(routes, { prefix: '/trpc/publicPollRoutes' });
};

export default fastifyPlugin(publicPoll);
