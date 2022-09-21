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
            callback(undefined, session);
          })
          .catch((reason) => {
            callback(reason);
          });
      },
      set(sessionId, session, callback) {
        const { userSession } = session;
        const sessionCsrfToken = session.get<string>('_csrf') || '';
        // 1. Save session in persistent storage
        // 2. Save session in session storage
        fastify.prismaClient?.session
          .upsert({
            where: {
              id: sessionId,
            },
            update: {
              csrfToken: sessionCsrfToken,
            },
            create: {
              id: sessionId,
              csrfToken: sessionCsrfToken,
              userId: userSession?.userId,
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
