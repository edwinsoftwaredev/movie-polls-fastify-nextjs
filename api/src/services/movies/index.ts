import { UserSession } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { searchMovies as searchMovieDecorator } from './decorators/search-movies';
import routes from './plugins/routes';

const movies: FastifyPluginAsync = async (fastify) => {
  // visit: https://github.com/upstash/ratelimit
  const searchMovies = async (
    userSession: UserSession,
    ...args: Parameters<typeof searchMovieDecorator>
  ) => {
    const p = fastify.redisClient.pipeline();
    p.incr(`search-count-${userSession.userId}`);
    p.expire(`search-count-${userSession.userId}`, 3600 * 24);

    const pResult = await p.exec<[number, number]>();
    const { '0': searchCount } = pResult;

    if (searchCount === 25) throw new Error('LIMIT_REACHED');

    return searchMovieDecorator(...args);
  };

  fastify.decorate('movies', {
    search: searchMovies,
  });

  fastify.register(routes, { prefix: '/trpc/moviesRoutes' });
};

export default fastifyPlugin(movies);
