import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifySession from '@fastify/session';

interface SessionPluginOptions extends FastifyPluginOptions {}

const session: FastifyPluginAsync<SessionPluginOptions> = async (
  fastify,
  opts
) => {
  opts;

  fastify.register(fastifySession, {
    secret: process.env.SESSION_SECRET as string,
    cookie: {
      sameSite: 'strict',
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000,
    },
    // TODO: consider using a RedisJSON
    // instead of manually parsing JSON strings
    store: {
      // Adding "workaround" type to callback param,
      // this is due to stores(express.js like stores) compatability issues on the
      // @fastify/session plugin
      get(sessionId, callback: (...args: Array<any>) => void) {
        fastify.redisClient
          .get(sessionId)
          .then((sessionJson) => {
            // if session is not found in the session store
            // return null
            if (!sessionJson) return null;
            const session = JSON.parse(sessionJson);
            callback(null, session);
            return session;
          })
          .then((session) => {
            // if session found
            // return session
            if (session) return session;

            return fastify.prismaClient.session
              .findUniqueOrThrow({
                where: {
                  id: sessionId,
                },
              })
              .then((session) => {
                callback(null, session);
                return session;
              })
              .catch((reason: Error) => {
                callback(reason, null);
              });
          });
      },
      set(sessionId, session, callback) {
        const { userSession } = session;
        const sessionCsrfToken = session.get<string>('_csrf');
        // Save session in persistent store
        // Then save session in session store
        fastify.prismaClient.session
          .upsert({
            where: {
              id: sessionId,
            },
            update: {
              csrfToken: userSession.csrfToken,
            },
            create: {
              id: sessionId,
              csrfToken: sessionCsrfToken,
              userId: userSession.userId,
            },
          })
          .then((session) => {
            const sessionJSON = JSON.stringify(session);
            return fastify.redisClient.set(session.id, sessionJSON);
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
          .then(() => {
            return fastify.prismaClient.session.delete({
              where: {
                id: sessionId,
              },
            });
          })
          .catch((reason) => {
            callback(reason);
          });
      },
    },
  });

  fastify.addHook('preHandler', async (req, res) => {
    if (!req.session.userSession.userId) return res.redirect(301, '/');
  });
};

export default session;
