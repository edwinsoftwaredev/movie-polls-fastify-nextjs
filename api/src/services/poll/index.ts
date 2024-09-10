import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {
  createPoll,
  getActivePolls,
  getInactivePolls,
  getPoll,
  updatePoll,
  removePoll,
  addMovie,
  removeMovie,
  addVotingTokens,
  getVotingTokens,
  updateVotingToken,
  removeVotingToken
} from './decorators';
import routes from './plugins/routes';

// interface PollPluginOpts extends FastifyPluginOptions {}

const poll: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('polls', {
    getActivePolls: getActivePolls(fastify),
    getInactivePolls: getInactivePolls(fastify),
    createPoll: createPoll(fastify),
    getPoll: getPoll(fastify),
    updatePoll: updatePoll(fastify),
    removePoll: removePoll(fastify),
    addMovie: addMovie(fastify),
    removeMovie: removeMovie(fastify),
    addVotingTokens: addVotingTokens(fastify),
    getVotingTokens: getVotingTokens(fastify),
    updateVotingToken: updateVotingToken(fastify),
    removeVotingToken: removeVotingToken(fastify),
  });

  fastify.register(routes, { prefix: '/trpc/pollRoutes' });
};

export default fastifyPlugin(poll);
