import { Prisma } from '@prisma/client';
import { inferAsyncReturnType, TRPCError } from '@trpc/server';
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

export function trcpErrorHandler(procedureError: {
  error: TRPCError; // the original error
  type: 'query' | 'mutation' | 'subscription' | 'unknown';
  path: string | undefined; // path of the procedure that was triggered
  input: unknown;
  ctx: Context | undefined;
  req: CreateFastifyContextOptions['req']; // request object
}) {
  const { error } = procedureError;
  // TODO: send to bug reporting
  if (error.cause instanceof Prisma.PrismaClientKnownRequestError) {
  }

  // TODO: Create custom Error
  if (error.cause instanceof Error) {
  }
}
