import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import { UserSession } from '@prisma/client';

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
    // https://redis.com/blog/cache-vs-session-store/
    store: {
      // Adding "workaround" type to callback param,
      // this is due to stores(express.js like stores) compatability issues on the
      // @fastify/session plugin
      get(sessionId, callback: (...args: Array<any>) => void) {
        fastify.log.info('Getting session...');
        fastify.redisClient
          .get<UserSession>(sessionId)
          .then(userSession => {
            // NOTE that a userSession is returned which is part
            // of the session object. also the _csrf token in session is
            // overwritten.
            fastify.log.info(`Session found.`);
            callback(undefined, {
              // in case the userSession is not defined
              // this validation will prevent setting the _csrf
              // to undefined
              ...(userSession ? { _csrf: userSession.csrfToken } : {}),
              userSession,
            });
          })
          .catch((reason) => {
            fastify.log.error(reason);
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

        fastify.log.info('Session upsert...');
        fastify.redisClient
          .set<UserSession>(sessionId, {
            ...(userSession || { userId: null }),
            id: sessionId,
            csrfToken: sessionCsrfToken,
            expiresOn: session.cookie.expires ?? null,
          }, { 
            ex: session.cookie.maxAge || 0,
          })
          .then(_ => {
            fastify.log.info('Session updated.')
            callback();
          })
          .catch(reason => {
            callback(reason);
          });
      },
      destroy(sessionId, callback) {
        fastify.log.info('Session destroy...');
        fastify.redisClient
          .del(sessionId)
          .then(() => {
            fastify.log.info('Session destroyed.');
            callback();
          })
          .catch((reason) => {
            callback(reason);
          });
      },
    },
  });
};

export default fastifyPlugin(session);
