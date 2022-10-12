import fastifyPlugin from 'fastify-plugin';
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { googleAuthRouter } from 'trpc/server/routers';
import { createTRPCFastifyContext } from 'trpc/server';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyTRPCPlugin, {
    trpcOptions: {
      router: googleAuthRouter,
      createContext: createTRPCFastifyContext(fastify),
    },
  });
};

interface GoogleAuthPluginOpts extends FastifyPluginOptions {
  clientId: string;
}

const googleOAuth2Client: FastifyPluginAsync<GoogleAuthPluginOpts> = async (
  fastify,
  opts
) => {
  const { clientId } = opts;
  const oauth2Client = new OAuth2Client(clientId);

  fastify.decorate('googleOAuth2Client', oauth2Client);

  // NOTE that instead of attaching the function oauth2Client.verifyIdToken
  // to the Session plugin, which will require to assign the function to a session's
  // property and BIND(this will create a new function based on auth2Client FOR EACH REQUEST)
  // the auth2Client object to the function attached, it is attached to the Fastify instance.
  //
  // It is important to note that the function oauth2Client.verifyIdToken IS NOT directly
  // assigned to the Fastify's verifyGoogleIdToken property, but it is WRAPPED in an arrow function
  // which binds the oauth2Client variable instance of OAuth2Client to oauth2Client.verifyIdToken.
  // This binding happends ON CREATION time and NOT when the arrow function is called.
  // This is possible due to how Clousures and Arrow Functions work in JavaScript.
  //
  // It is also important to note that doing Destructuring Assignment(e.g const { verifyIdToken } = oauth2Client)
  // instead of const verifyIdToken = auth2Client.verifyIdToken, will remove the bound between
  // verifyIdToken and auth2Client.
  //
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
  fastify.decorate('verifyGoogleIdToken', (idToken: string) =>
    oauth2Client.verifyIdToken({ idToken })
  );

  fastify.register(routes, { prefix: '/trpc/googleAuthRoutes' });
};

export default fastifyPlugin(googleOAuth2Client);
