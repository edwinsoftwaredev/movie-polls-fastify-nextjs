import createRouter from "../createRouter";

const movies = createRouter().query('homeMovies', {
  resolve: async ({ctx}) => {
    const { fastify } = ctx;
    const p = fastify.redisClient.pipeline();

    fastify.movies.nowPlaying(p);
    fastify.movies.popular(p);
    fastify.movies.trending(p);

    const result = await p.exec<[
      Awaited<ReturnType<typeof fastify.movies.nowPlaying>>,
      Awaited<ReturnType<typeof fastify.movies.popular>>,
      Awaited<ReturnType<typeof fastify.movies.trending>>,
    ]>();

    return { 
      nowPlaying: result[0],
      popular: result[1],
      trending: result[2], 
    };
  }
}).query('trendingByGenre', {
  resolve: async ({ctx}) => {
    const { fastify } = ctx;
    const trendingByGenre = await fastify.movies.trendingByGenre();
    return { trendingByGenre };
  }
});

const moviesRouter = createRouter().merge('movies:', movies);
export default moviesRouter;
