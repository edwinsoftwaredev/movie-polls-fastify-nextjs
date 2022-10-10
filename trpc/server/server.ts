import createRouter from './createRouter';
import { googleIDTokenVerification, account, session } from './routers';
const appRouter = createRouter()
  .merge('session:', session)
  .merge('account:', account)
  .merge('googleIDTokenVerification:', googleIDTokenVerification);

export type AppRouter = typeof appRouter;
export default appRouter;
