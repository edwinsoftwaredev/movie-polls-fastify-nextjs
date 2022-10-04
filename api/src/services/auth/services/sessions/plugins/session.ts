import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';

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

  fastify.register(fastifySession, {
    secret: sessionSecret,
    cookie: {
      sameSite: 'strict',
      httpOnly: true,
      secure: !isDevEnv,
      maxAge: 15 * 60 * 1000,
    },
    rolling: false,
    // TODO: consider using a RedisJSON
    // instead of manually parsing JSON strings (slow)
    store: {
      // Adding "workaround" type to callback param,
      // this is due to stores(express.js like stores) compatability issues on the
      // @fastify/session plugin
      get(sessionId, callback: (...args: Array<any>) => void) {
        fastify.redisClient
          .get(sessionId)
          .then((sessionJson) => {
            if (sessionJson) return JSON.parse(sessionJson);
            // If session not found in cache
            // search session in persistent storage
            return fastify.prismaClient.session
              .findUniqueOrThrow({
                where: {
                  id: sessionId,
                },
              })
              .then((userSession) => ({
                id: userSession.id,
                _csrf: userSession.csrfToken,
                userId: userSession.userId,
              }));
          })
          .then((session) => {
            callback(undefined, { userSession: session });
          })
          .catch((reason) => {
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
        // 1. Save session in persistent storage
        // 2. Save session in session storage

        const getUser = async () => {
          if (!userSession.userId) return Promise.resolve();
          return fastify.prismaClient.user.findUnique({
            where: {
              id: userSession.userId
            }
          });
        }

        // Removes a user session.
        // Because a new session could be generated or invalidated
        // by the fastify-session plugin and because a user can only
        // have one session, existent user session has to be removed. 
        const removeExistingUserSession = async () => {
          if (!userSession?.userId) return Promise.resolve();
          return fastify.prismaClient.session.findUnique({
            where: {
              userId: userSession.userId
            }
          }).then(sessionRes => {
            if (!sessionRes) return;

            const resRedis = fastify.redisClient.del(sessionRes.id);
            const resPrisma = fastify.prismaClient.session.delete({
              where: {
                id: sessionRes.id
              }
            });

            return Promise.all([
              resRedis,
              resPrisma
            ]);
          });
        }

        // Upserts a session
        // Checks: 
        // The userSession may contain a userId for a user that may not exists.
        // In order to update/create a session, the existent of a user should be 
        // validated first.
        const upsertUserSession = (userExists: boolean) => fastify.prismaClient
          .session.upsert({
            where: {
              id: sessionId,
            },
            update: {
              csrfToken: sessionCsrfToken,
              ...(userExists ? { userId: userSession?.userId } : {}),
            },
            create: {
              id: sessionId,
              csrfToken: sessionCsrfToken,
              ...(userExists ? { userId: userSession?.userId } : {}),
            },
          })
          .then((userSession) => {
            // The session type retrived from the session storage is not the same
            // as the type retrived from the persistant storage
            const { id: sessionId, csrfToken: _csrf, userId } = userSession;
            const sessionJSON = JSON.stringify({
              sessionId,
              _csrf,
              userId,
            });
            return fastify.redisClient.set(sessionId, sessionJSON);
          })
          .then(() => {
            callback(undefined);
          })
          .catch((reason) => {
            callback(reason);
          });

        // 1. Removes existing user session
        // 2. Validates if the defined in the session object exists
        // 3. Creates/Updates a session considering if user exists 
        removeExistingUserSession()
          .then(() => getUser())
          .then(user => upsertUserSession(!!user));
      },
      destroy(sessionId, callback) {
        // Remove session from session store
        // Then remove session from persistent storage
        fastify.redisClient
          .del(sessionId)
          .then(() =>
            fastify.prismaClient.session.delete({
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
