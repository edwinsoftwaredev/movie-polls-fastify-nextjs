import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import { UserSession } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

interface SessionPluginOptions extends FastifyPluginOptions {
  sessionSecret: string;
  isDevEnv: boolean;
}

const session: FastifyPluginAsync<SessionPluginOptions> = async (
  fastify,
  opts
) => {
  const { sessionSecret, isDevEnv } = opts;

  fastify.register(fastifyCookie);

  fastify.addHook('preHandler', async (req) => {
    const isSSR = req.headers['x-ssr'] === '1';
    const hasSessionId = !!req.cookies['sessionId'];
    req.session.set('isSSR', isSSR);
    req.session.set('hasSessionId', hasSessionId);

    // Adding the Google ID verification functionality
    // to the session
    req.session.verifyGoogleIdToken = fastify.verifyGoogleIdToken;
  });

  // TODO: Remove database query
  fastify.register(fastifySession, {
    secret: sessionSecret,
    cookie: {
      sameSite: 'strict',
      httpOnly: true,
      secure: !isDevEnv,
      maxAge: 15 * 60 * 1000,
    },
    rolling: false,
    store: {
      // Adding "workaround" type to callback param,
      // this is due to stores(express.js like stores) compatability issues on the
      // @fastify/session plugin
      get(sessionId, callback: (...args: Array<any>) => void) {
        fastify.redisClient
          .get<UserSession>(sessionId)
          .then((userSession) => {
            if (userSession) return userSession;
            // If session not found in cache
            // search session in persistent storage
            return fastify.prismaClient.userSession.findUniqueOrThrow({
              where: {
                id: sessionId,
              },
            });
          })
          .then((userSession) => {
            // NOTE that a userSession is returned which is part
            // of the session object. also the _csrf token in session is
            // overwritten.
            // TODO: validate when should the csrfToken should be recreated
            callback(undefined, {
              _csrf: userSession.csrfToken,
              userSession,
            });
          })
          .catch((reason) => {
            // TODO: Fix that if the session is not found
            // (e.g user has a sessionID cookie but the session is not found on server side
            // or that a process on server side removed all expired sessions),
            // instead of showing the message session not found,
            // the server should redirect the user to the auth page and reset the session
            // cookie with a new id
            callback(reason);
          });
      },
      set(sessionId, session, callback) {
        const isSSR = session.get('isSSR') ?? false;
        const hasSessionId = session.get('hasSessionId') ?? false;
        // If SSR and sessionId is not provided in the request,
        // the session is not created.
        // NOTE: While this validation will prevent saving a new session
        // generated by the server(web-client server) and
        // not the client(browser) it will not prevent the execution
        // of the functionality to generate a new session by the session plugin
        // (create a session and signed it)
        if (isSSR && !hasSessionId) {
          callback();
          return;
        }

        const { userSession } = session;
        const sessionCsrfToken = session.get<string>('_csrf') || '';
        // 1. Check that session exists in session storage
        // 2. If session exists in session storage save/update session
        //    in session storage and call callback.
        // 2. If session does not exists in session storage
        //    save session in persistent storage and then in session storage
        //    and call callback.
        //
        // https://redis.com/blog/cache-vs-session-store/
        fastify.redisClient.get<UserSession>(sessionId).then((storedSession) => {
          if (storedSession) {
            const updatedUserSession: UserSession = ({
              ...storedSession,
              userId: userSession?.userId,
              csrfToken: sessionCsrfToken,
              expiresOn: session.cookie.expires ?? null,
            });

            fastify.redisClient
              .set<UserSession>(sessionId, updatedUserSession)
              .then(() => {
                callback();
              });
          } else {
            // If user was removed from database but from redis
            // the userId constraint will fail
            fastify.prismaClient.userSession
              .upsert({
                where: {
                  id: sessionId,
                },
                update: {
                  csrfToken: sessionCsrfToken,
                  // TODO: validate that the user's id is the same
                  // on every update
                  userId: userSession?.userId,
                  expiresOn: session.cookie.expires,
                },
                create: {
                  id: sessionId,
                  csrfToken: sessionCsrfToken,
                  userId: userSession?.userId,
                  expiresOn: session.cookie.expires,
                },
              })
              .then((userSession) => {
                return fastify.redisClient.set<UserSession>(sessionId, ({
                  id: sessionId,
                  csrfToken: userSession.csrfToken,
                  userId: userSession.userId,
                  expiresOn: userSession.expiresOn,
                }));
              })
              .then(() => {
                callback(undefined);
              })
              .catch((reason) => {
                if (reason instanceof PrismaClientKnownRequestError) {
                  // checks that error is produced by the userId constraint
                  // failing. If that is the case remove the session from redis
                  if (
                    reason.code === 'P2003' &&
                    reason.meta &&
                    reason.meta['field_name'] === 'userId'
                  )
                    fastify.redisClient.del(sessionId);
                } else {
                  callback(reason);
                }
              });
          }
        });
      },
      destroy(sessionId, callback) {
        // 1. Remove session from session storage
        // 2. Remove session from persistent storage
        //
        // https://redis.com/blog/cache-vs-session-store/
        fastify.redisClient
          .del(sessionId)
          .then(() =>
            fastify.prismaClient.userSession.delete({
              where: {
                id: sessionId,
              },
            })
          )
          .then(() => {
            callback();
          })
          .catch((reason) => {
            callback(reason);
          });
      },
    },
  });

  fastify.addHook('preHandler', async (req, res) => {
    if (!req.session.userSession?.userId) {
      // res.redirect(301, '/');
    }
  });
};

export default fastifyPlugin(session);
