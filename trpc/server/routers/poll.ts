import { z } from 'zod';
import { procedure, router } from '../init-tRPC';
import { Poll } from '@prisma/client';

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
          .min(2, { message: 'Must be 80 or more characters long.' }),
        movieId: z.optional(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fastify, req } = ctx;
      const { movieId, name } = input;
      const userSession = req.session.userSession!;

      const result = await fastify.polls.createPoll(userSession, name, movieId);

      return { poll: result };
    }),

  // PUT: /polls/1
  updatePoll: procedure
    .input((val) => ({ poll: val as Poll }))
    .mutation(async ({ ctx, input }) => {
      const { fastify, req } = ctx;
      const { poll } = input;
      const userSession = req.session.userSession!;

      const result = await fastify.polls.updatePoll(userSession, poll);

      return { poll: result };
    }),

  // DELETE: /polls/1
  removePoll: procedure
    .input(
      z.object({
        pollId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fastify, req } = ctx;
      const { pollId } = input;
      const userSession = req.session.userSession!;

      const result = await fastify.polls.removePoll(userSession, pollId);

      return { poll: result };
    }),

  // POST: /polls/1/movies
  addMovie: procedure
    .input(
      z.object({
        pollId: z.string(),
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
        pollId: z.string(),
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
});

export default router({ poll: pollRouter });
