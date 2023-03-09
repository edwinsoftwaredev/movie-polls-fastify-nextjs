import { mergeRouters } from './init-tRPC';
import {
  accountRouter,
  googleAuthRouter,
  moviesRouter,
  publicMoviesRouter,
  sessionRouter,
  pollRouter,
  publicPollRouter,
} from './routers';

// Add routes to appRouter -------
const appRouter = mergeRouters(
  sessionRouter,
  accountRouter,
  googleAuthRouter,
  moviesRouter,
  publicMoviesRouter,
  pollRouter,
  publicPollRouter
);
// -------------------------------

export type AppRouter = typeof appRouter;
