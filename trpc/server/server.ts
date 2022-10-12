// TODO: should refactor client/utils and remove this module?
import createRouter from './createRouter';
import { googleAuthRouter, accountRouter, sessionRouter } from './routers';

const appRouter = createRouter()
  .merge(sessionRouter)
  .merge(accountRouter)
  .merge(googleAuthRouter);

export type AppRouter = typeof appRouter;
export default appRouter;
