import { createReactQueryHooks } from '@trpc/react';
import { SessionRouter, AccountRouter, GoogleAuthRouter } from 'trpc/client';

export const session = createReactQueryHooks<SessionRouter>();
export const account = createReactQueryHooks<AccountRouter>();
export const googleAuth = createReactQueryHooks<GoogleAuthRouter>();

export default { session, account, googleAuth };
