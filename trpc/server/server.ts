
import createRouter from "./createRouter";
import { accountRouter, googleAuthRouter, sessionRouter } from './routers';

// Add routes to appRouter -------
const appRouter = createRouter()
  .merge(sessionRouter)
  .merge(accountRouter)
  .merge(googleAuthRouter);
// -------------------------------

export type AppRouter = typeof appRouter;
