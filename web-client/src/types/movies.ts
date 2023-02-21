import { InferQueryOutput } from 'trpc/client/utils';

export type Movies =
  InferQueryOutput<'publicMovies'>['trendingByGenre']['trendingByGenre'][0]['results'];

export type MovieProviders =
  InferQueryOutput<'publicMovies'>['movieProviders']['movieProviders'];

export type Movie = Movies[0];
