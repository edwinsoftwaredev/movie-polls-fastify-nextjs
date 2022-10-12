import sessionRouter, { SessionRouter } from './session';
import accountRouter, { AccountRouter } from './account';
import googleAuthRouter, { GoogleAuthRouter } from './googleAuth';

export type AppRouter = SessionRouter | AccountRouter | GoogleAuthRouter;

export {
  sessionRouter,
  SessionRouter,
  accountRouter,
  AccountRouter,
  googleAuthRouter,
  GoogleAuthRouter,
};
