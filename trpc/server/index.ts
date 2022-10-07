// DO NOT IMPORT CODE FROM THIS DIRECTORY ON CLIENT SIDE
import appRouter, { AppRouter } from './server';
import createRouter from './createRouter';

export { Context, createTRPCFastifyContext } from './context';
export { appRouter, AppRouter, createRouter };
