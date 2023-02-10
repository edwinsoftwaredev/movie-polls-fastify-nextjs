import { mergeRouters } from './init-tRPC';
import {
  accountRouter,
  googleAuthRouter,
  moviesRouter,
  publicMoviesRouter,
  sessionRouter,
  pollRouter,
} from './routers';

// Add routes to appRouter -------
const appRouter = mergeRouters(
  sessionRouter,
  accountRouter,
  googleAuthRouter,
  moviesRouter,
  publicMoviesRouter,
  pollRouter
);
// -------------------------------

export type AppRouter = typeof appRouter;
