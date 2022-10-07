import { createReactQueryHooks } from '@trpc/react';
import { AppRouter } from 'trpc/client';

export const trpc = createReactQueryHooks<AppRouter>();
