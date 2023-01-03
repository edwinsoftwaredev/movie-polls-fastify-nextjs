import { mergeRouters, router } from './init-tRPC';
import {
  accountRouter,
  googleAuthRouter,
  moviesRouter,
  publicMoviesRouter,
  sessionRouter,
} from './routers';

// Add routes to appRouter -------
const appRouter = mergeRouters(
  sessionRouter,
  accountRouter,
  googleAuthRouter,
  moviesRouter,
  publicMoviesRouter
);
// -------------------------------

export type AppRouter = typeof appRouter;
