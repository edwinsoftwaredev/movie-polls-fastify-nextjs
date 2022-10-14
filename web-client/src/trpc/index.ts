import { createReactQueryHooks } from '@trpc/react';
import { AppRouter } from 'trpc/client';

const trpc = createReactQueryHooks<AppRouter>();
export default trpc;
