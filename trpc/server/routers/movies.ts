import createRouter from "../createRouter";

const movies = createRouter().query('nowPlaying', {
  resolve: async ({ctx}) => {
    const { fastify } = ctx;
    const nowPlaying = await fastify.movies.nowPlaying();
    return { nowPlaying };
  }
});

const moviesRouter = createRouter().merge('movies:', movies);
export default moviesRouter;
