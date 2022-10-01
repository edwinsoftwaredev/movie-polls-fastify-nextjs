import { inferAsyncReturnType } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

export function createContext({ req, res }: CreateFastifyContextOptions) {
  console.log('1', req.session.verifyGoogleIdToken);
  return {
    req,
    res,
    session: req.session,
    verifyGoogleIdToken: req.session.verifyGoogleIdToken,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
