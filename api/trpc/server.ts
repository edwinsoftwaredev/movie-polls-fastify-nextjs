import createRouter from './createRouter';
import { googleIDVerification, account, session } from './routers';
const appRouter = createRouter()
  .merge('session:', session)
  .merge('account:', account)
  .merge('googleIDVerification:', googleIDVerification);

export type AppRouter = typeof appRouter;
export default appRouter;
