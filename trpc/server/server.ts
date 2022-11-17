
import createRouter from "./createRouter";
import { accountRouter, googleAuthRouter, moviesRouter, sessionRouter } from './routers';

// Add routes to appRouter -------
const appRouter = createRouter()
  .merge(sessionRouter)
  .merge(accountRouter)
  .merge(googleAuthRouter)
  .merge(moviesRouter);
// -------------------------------

export type AppRouter = typeof appRouter;
