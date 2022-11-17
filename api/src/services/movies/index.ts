import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import cachedMovies from './plugins/cached-movies';
import routes from './plugins/routes';

export interface MoviesPluginOptions extends FastifyPluginOptions {}

const movies: FastifyPluginAsync<MoviesPluginOptions> = async (fastify) => {
  fastify.register(cachedMovies);
  fastify.register(
    async (instance) => {
      // Protects the entire plugin from CSRF attacks
      instance.addHook('onRequest', instance.csrfProtection);

      // TODO: Refactor
      // Validates that user is authenticated
      instance.addHook('preHandler', async (req, res) => {
        if (req.session.userSession?.userId) return res;

        // rejects request
        res.code(401);
        res.send();
        return res;
      });

      instance.register(routes);
    },
    { prefix: '/trpc/moviesRoutes' }
  );
};

export default movies;
