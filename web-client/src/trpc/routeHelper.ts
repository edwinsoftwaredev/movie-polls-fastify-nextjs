const trpcRoutersPaths: { [key: string]: string } = {
  'session.': 'sessionRoutes/session.',
  'account.': 'accountRoutes/account.',
  'googleAuth.': 'googleAuthRoutes/googleAuth.',
  'movies.': 'moviesRoutes/movies.',
  'publicMovies.': 'publicMoviesRoutes/publicMovies.',
};

export const getRoute = (aUrl: string) => {
  let bUrl = aUrl
    .toString()
    .replace(trpcRoutersPaths[0], trpcRoutersPaths[trpcRoutersPaths[0]]);

  for (let key in trpcRoutersPaths) {
    bUrl = bUrl.replace(key, trpcRoutersPaths[key]);
  }

  return bUrl;
};
