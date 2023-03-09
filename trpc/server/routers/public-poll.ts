import { TRPCError } from '@trpc/server';
import { procedure, router } from '../init-tRPC';
import { z } from 'zod';

const publicPollRouter = router({
  poll: procedure
    .input(
      z.object({
        pollId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input: { pollId } }) => {
      const { fastify } = ctx;
      const poll = await fastify.publicPolls.getPoll(pollId);

      if (!poll.isActive)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });

      return { poll };
    }),

  votingToken: procedure
    .input(
      z.object({
        id: z.string().uuid(),
        pollId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input: { id, pollId } }) => {
      const { fastify } = ctx;
      const votingToken = await fastify.publicPolls.getVotingToken(pollId, id);

      return { votingToken };
    }),

  vote: procedure
    .input(
      z.object({
        pollId: z.string().uuid(),
        votingTokenId: z.string().uuid(),
        movieId: z.number(),
      })
    )
    .mutation(async ({ ctx, input: { pollId, votingTokenId, movieId } }) => {
      const { fastify } = ctx;
      const result = await fastify.publicPolls.voteHandler(
        pollId,
        votingTokenId,
        movieId
      );

      return { pollData: result };
    }),
});

export default router({ publicPoll: publicPollRouter });
