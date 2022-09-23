import createRouter from './createRouter';
import { session } from './routers';
const appRouter = createRouter().merge('session:', session);

export type AppRouter = typeof appRouter;
export default appRouter;
