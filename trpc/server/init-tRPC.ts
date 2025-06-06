import { DynamoDBServiceException } from '@aws-sdk/client-dynamodb';
import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  errorFormatter: ({ error, type, path, input, ctx, shape }) => {
    shape = { ...shape, data: { ...shape.data, stack: undefined } };

    if (error.cause instanceof DynamoDBServiceException) {
      switch (true) {
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
          break;
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
          code: shape.data.code ?? 'INTERNAL_SERVER_ERROR',
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
