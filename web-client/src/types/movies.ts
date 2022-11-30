import { InferQueryOutput } from "trpc/client/utils";

export type Movies =
  InferQueryOutput<'movies:trendingByGenre'>['trendingByGenre'][0]['results'];

export type Movie = Movies[0];
