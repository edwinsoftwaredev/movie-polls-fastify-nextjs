import { z } from 'zod';
import { procedure, router } from '../init-tRPC';
import { Poll, VotingToken } from '@prisma/client';

// TODO: Add Prisma-Zod generators
const pollRouter = router({
  // GET: /polls/active
  activePolls: procedure.query(async ({ ctx }) => {
    const { fastify, req } = ctx;
    const userSession = req.session.userSession!;

    const result = await fastify.polls.getActivePolls(userSession);

    return { polls: result };
  }),

  // GET: /polls/inactive
  inactivePolls: procedure.query(async ({ ctx }) => {
    const { fastify, req } = ctx;
    const userSession = req.session.userSession!;

    const result = await fastify.polls.getInactivePolls(userSession);

    // TODO: remove authorId
    return { polls: result };
  }),

  // POST: /polls
  createPoll: procedure
    .input(
      z.object({
        name: z
          .string()
          .trim()
          .max(80, { message: 'Must be 80 or fewer characters long.' })
          .min(2, { message: 'Must be 2 or more characters long.' }),
        movieId: z.optional(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fastify, req } = ctx;
      const { movieId, name } = input;
      const userSession = req.session.userSession!;

      const result = await fastify.polls.createPoll(userSession, name, movieId);
      // TODO: remove authorId
      return { poll: result };
    }),

  // GET: /polls/:id
  getPoll: procedure
    .input(z.object({ pollId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { fastify, req } = ctx;
      const userSession = req.session.userSession!;
      const { pollId } = input;

      const result = await fastify.polls.getPoll(userSession, pollId);

      // TODO: remove authorId
      return { poll: result };
    }),

  // PUT: /polls/1
  updatePoll: procedure
    .input((val) => val as Omit<Poll, 'authorId' | 'createdAt'>)
    .mutation(async ({ ctx, input: poll }) => {
      const { fastify, req } = ctx;
      const userSession = req.session.userSession!;

      const result = await fastify.polls.updatePoll(userSession, poll);

      // TODO: remove authorId
      return { poll: result };
    }),

  // DELETE: /polls/1
  removePoll: procedure
    .input(
      z.object({
        pollId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fastify, req } = ctx;
      const { pollId } = input;
      const userSession = req.session.userSession!;

      const result = await fastify.polls.removePoll(userSession, pollId);

      // TODO: remove authorId
      return { poll: result };
    }),

  // POST: /polls/1/movies
  addMovie: procedure
    .input(
      z.object({
        pollId: z.string().uuid(),
        movieId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fastify, req } = ctx;
      const { pollId, movieId } = input;
      const userSession = req.session.userSession!;

      const result = await fastify.polls.addMovie(userSession, pollId, movieId);

      return { moviePoll: result };
    }),

  // DELETE: /polls/1/movies/1
  removeMovie: procedure
    .input(
      z.object({
        pollId: z.string().uuid(),
        movieId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fastify, req } = ctx;
      const { movieId, pollId } = input;
      const userSession = req.session.userSession!;

      const result = await fastify.polls.removeMovie(
        userSession,
        pollId,
        movieId
      );

      return { moviePoll: result };
    }),

  votingTokens: procedure
    .input(
      z.object({
        pollId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input: { pollId } }) => {
      const { fastify, req } = ctx;
      const userSession = req.session.userSession!;
      const result = await fastify.polls.getVotingTokens(userSession, pollId);
      return { tokens: result };
    }),

  addVotingTokens: procedure
    .input(
      z.object({
        pollId: z.string().uuid(),
        amount: z.number().gte(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fastify, req } = ctx;
      const { pollId, amount } = input;

      const userSession = req.session.userSession!;

      const result = await fastify.polls.addVotingTokens(
        userSession,
        pollId,
        amount
      );

      // TODO: remove authorId
      return { poll: result };
    }),

  updateVotingToken: procedure
    .input((val) => val as Omit<VotingToken, 'createdAt'>)
    .mutation(async ({ ctx, input: votingToken }) => {
      const { fastify, req } = ctx;

      const userSession = req.session.userSession!;

      const result = await fastify.polls.updateVotingToken(
        userSession,
        votingToken
      );

      return { votingToken: result };
    }),

  removeVotingToken: procedure
    .input(z.object({
      pollId: z.string().uuid(),
      id: z.string().uuid()
    }))
    .mutation(async ({ ctx, input: votingToken }) => {
      const { fastify, req } = ctx;
      const userSession = req.session.userSession!;

      const result = await fastify.polls.removeVotingToken(
        userSession,
        votingToken.pollId,
        votingToken.id
      );

      // TODO: remove authorId
      return { poll: result };
    }),
});

export default router({ poll: pollRouter });
