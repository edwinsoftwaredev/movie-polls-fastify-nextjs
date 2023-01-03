import { initTRPC } from '@trpc/server';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const middleware = t.middleware;
export const procedure = t.procedure;
export const mergeRouters = t.mergeRouters;
