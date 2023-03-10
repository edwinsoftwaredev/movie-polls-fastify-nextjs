import { UserSession, PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { OAuth2Client, LoginTicket } from 'google-auth-library';
// Current project configuration requires to define full path
// (e.g "paths" is not defined in tsconfig.json)
import type {
  GetPoll as GetPublicPoll,
  GetVotingToken,
  VoteHandler,
} from '../../src/services/public-poll/decorators';

import type {
  Movie,
  MovieDetails,
  MovieProviders,
} from '../../src/services/public-movies/decorators';

import type { SearchMovies } from '../../src/services/movies/decorators';

import type { GetUser } from '../../src/services/auth/services/account/decorators';

import type {
  AddMovie,
  AddVotingTokens,
  CreatePoll,
  GetActivePolls,
  GetInactivePolls,
  GetPoll,
  GetVotingTokens,
  RemoveMovie,
  RemovePoll,
  RemoveVotingToken,
  UpdatePoll,
  UpdateVotingToken,
} from '../../src/services/poll/decorators';

import {
  Movie as MovieType,
  MoviesByGenre,
} from '../../src/services/public-movies/types';

// Importing these type declaration allows the LSP to
// provide methods and properties from them.
// (type/module/global module augmentation)
// TODO: validate that importing these types
// does not affect builds
//
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html
// https://www.fastify.io/docs/latest/Reference/TypeScript/#using-a-plugin
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
import type * as FastifySession from '@fastify/session';
import type * as FastifyCsrf from '@fastify/csrf-protection';
import type * as Fastify from 'fastify';
import { Pipeline } from '@upstash/redis/types/pkg/pipeline';

declare module 'fastify' {
  interface FastifyInstance {
    redisClient: Redis;
    prismaClient: PrismaClient;
    googleOAuth2Client: OAuth2Client;
    verifyGoogleIdToken: (idToken: string) => Promise<LoginTicket>;

    // services
    account: {
      user: {
        getUser: GetUser;
      };
    };

    movies: {
      nowPlaying: (redisPipeline: Pipeline) => Array<MovieType>;
      popular: (redisPipeline: Pipeline) => Array<MovieType>;
      trending: (redisPipeline: Pipeline) => Array<MovieType>;
      trendingByGenre: (redisPipeline: Pipeline) => Array<MoviesByGenre>;
      popularByDecadeAndGenre: (
        redisPipeline: Pipeline,
        decade: number
      ) => Array<MoviesByGenre>;
      search: SearchMovies;
      movie: Movie;
      movieDetails: MovieDetails;
      movieProviders: MovieProviders;
    };

    polls: {
      getActivePolls: GetActivePolls;
      getInactivePolls: GetInactivePolls;
      createPoll: CreatePoll;
      getPoll: GetPoll;
      updatePoll: UpdatePoll;
      removePoll: RemovePoll;
      addMovie: AddMovie;
      removeMovie: RemoveMovie;
      addVotingTokens: AddVotingTokens;
      getVotingTokens: GetVotingTokens;
      updateVotingToken: UpdateVotingToken;
      removeVotingToken: RemoveVotingToken;
    };

    publicPolls: {
      getPoll: GetPublicPoll;
      getVotingToken: GetVotingToken;
      voteHandler: VoteHandler;
    };
  }

  interface Session {
    userSession?: UserSession | null;
    verifyGoogleIdToken: (idToken: string) => Promise<LoginTicket>;
  }
}
