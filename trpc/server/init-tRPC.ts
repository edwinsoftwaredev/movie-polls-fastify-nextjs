import { Prisma } from '@prisma/client';
import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  errorFormatter: ({ error, type, path, input, ctx, shape }) => {
    if (error.cause instanceof Prisma.PrismaClientKnownRequestError) {
      switch (true) {
        case error.cause.code === 'P2002': {
          shape = {
            ...shape,
            data: {
              ...shape.data,
              code: 'BAD_REQUEST',
              httpStatus: 400,
            },
            message: 'Duplicated.',
          };
          break;
        }

        case error.cause.code === 'P2025': {
          shape = {
            ...shape,
            data: {
              ...shape.data,
              code: 'NOT_FOUND',
              httpStatus: 404,
            },
            message: 'Not found.',
          };
          break;
        }

        default: {
          break;
        }
      }
    } else if (error.cause instanceof Error) {
      switch (true) {
        case error.cause.message === 'UNAUTHORIZED': {
          shape = {
            ...shape,
            data: {
              ...shape.data,
              code: 'UNAUTHORIZED',
              httpStatus: 401,
            },
          };
          break;
        }

        case error.cause.message === 'ACTIVE_POLL': {
          shape = {
            ...shape,
            data: {
              ...shape.data,
              code: 'BAD_REQUEST',
              httpStatus: 400,
            },
            message: 'Active poll.',
          };
          break;
        }

        case error.cause.message === 'LIMIT_REACHED': {
          shape = {
            ...shape,
            data: {
              ...shape.data,
              code: 'BAD_REQUEST',
              httpStatus: 400,
            },
            message: 'Limit reached.',
          };
          break;
        }

        case error.cause.message === 'INVALID_DATE': {
          shape = {
            ...shape,
            data: {
              ...shape.data,
              code: 'BAD_REQUEST',
              httpStatus: 400,
            },
            message: 'Invalid date.',
          };
        }

        default: {
          break;
        }
      }
    } else {
      shape = {
        ...shape,
        data: {
          ...shape.data,
          code: 'INTERNAL_SERVER_ERROR',
        },
      };
    }

    return shape;
  },
});

export const router = t.router;
export const middleware = t.middleware;
export const procedure = t.procedure;
export const mergeRouters = t.mergeRouters;
