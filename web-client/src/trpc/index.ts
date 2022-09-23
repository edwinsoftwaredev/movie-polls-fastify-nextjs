import { createReactQueryHooks } from '@trpc/react';
import type { AppRouter } from 'trpc/server';

export const trpc = createReactQueryHooks<AppRouter>();
