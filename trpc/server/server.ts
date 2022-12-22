
import createRouter from "./createRouter";
import { accountRouter, googleAuthRouter, moviesRouter, publicMoviesRouter, sessionRouter } from './routers';

// Add routes to appRouter -------
const appRouter = createRouter()
  .merge(sessionRouter)
  .merge(accountRouter)
  .merge(googleAuthRouter)
  .merge(moviesRouter)
  .merge(publicMoviesRouter);
// -------------------------------

export type AppRouter = typeof appRouter;
