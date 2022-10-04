import { inferAsyncReturnType } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { FastifyInstance } from 'fastify';

export function createTRPCFastifyContext(fastify: FastifyInstance) {
  return function ({ req, res }: CreateFastifyContextOptions) {
    return {
      req,
      res,
      fastify,
    };
  };
}

export type Context = inferAsyncReturnType<
  ReturnType<typeof createTRPCFastifyContext>
>;
