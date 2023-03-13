import { mergeRouters } from './init-tRPC';
import {
  accountRouter,
  googleAuthRouter,
  moviesRouter,
  publicMoviesRouter,
  sessionRouter,
  pollRouter,
  publicPollRouter,
  privateAccountRouter,
} from './routers';

// Add routes to appRouter -------
const appRouter = mergeRouters(
  sessionRouter,
  accountRouter,
  googleAuthRouter,
  moviesRouter,
  publicMoviesRouter,
  pollRouter,
  publicPollRouter,
  privateAccountRouter
);
// -------------------------------

export type AppRouter = typeof appRouter;
