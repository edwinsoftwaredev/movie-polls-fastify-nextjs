import {
  UserSession,
  PrismaClient,
  User,
  Poll,
  MoviePoll,
  VotingToken,
} from '@prisma/client';
import { Redis } from '@upstash/redis';
import { OAuth2Client, LoginTicket } from 'google-auth-library';
// Current project configuration requires to define full path
// (e.g "paths" is not defined in tsconfig.json)
import {
  Movie,
  MovieDetail,
  MovieProviders,
  MoviesByGenre,
} from '../../src/services/public-movies/types';

import type {
  GetPoll,
  GetVotingToken,
  VoteHandler,
} from '../../src/services/public-poll/types/decorators';

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
        getUser: (id: string) => Promise<User | null>;
      };
    };

    movies: {
      nowPlaying: (redisPipeline: Pipeline) => Promise<Array<Movie>>;
      popular: (redisPipeline: Pipeline) => Promise<Array<Movie>>;
      trending: (redisPipeline: Pipeline) => Promise<Array<Movie>>;
      trendingByGenre: (
        redisPipeline: Pipeline
      ) => Promise<Array<MoviesByGenre>>;
      popularByDecadeAndGenre: (
        redisPipeline: Pipeline,
        decade: number
      ) => Promise<Array<MoviesByGenre>>;
      search: (
        userSession: UserSession,
        searchTerm: string
      ) => Promise<Array<{ id: number }>>;
      genreNamesByIds: (genreIds: Array<number>) => Promise<Array<string>>;
      movie: (movieId: number) => Promise<Movie | null>;
      movieDetails: (movieId: number) => Promise<MovieDetail | null>;
      movieProviders: (movieId: number) => Promise<MovieProviders>;
    };

    polls: {
      getActivePolls: (userSession: UserSession) => Promise<
        (Poll & {
          MoviePoll: MoviePoll[];
        })[]
      >;
      getInactivePolls: (userSession: UserSession) => Promise<
        (Poll & {
          MoviePoll: MoviePoll[];
        })[]
      >;
      createPoll: (
        userSession: UserSession,
        pollName: string,
        movieId?: Movie['id']
      ) => Promise<
        Poll & {
          MoviePoll: MoviePoll[];
        }
      >;
      getPoll: (
        userName: UserSession,
        pollId: Poll['id']
      ) => Promise<
        Poll & {
          MoviePoll: MoviePoll[];
        }
      >;
      updatePoll: (
        userSession: UserSession,
        poll: Omit<Poll, 'authorId' | 'createdAt'>
      ) => Promise<Poll>;
      removePoll: (
        userSession: UserSession,
        pollId: Poll['id']
      ) => Promise<Poll>;
      addMovie: (
        userSession: UserSession,
        pollId: Poll['id'],
        movieId: Movie['id']
      ) => Promise<MoviePoll>;
      removeMovie: (
        userSession: UserSession,
        pollId: Poll['id'],
        movieId: Movie['id']
      ) => Promise<MoviePoll>;
      addVotingTokens: (
        userSession: UserSession,
        pollId: Poll['id'],
        tokenCount?: number
      ) => Promise<
        Poll & {
          VotingToken: VotingToken[];
        }
      >;
      getVotingTokens: (
        userSession: UserSession,
        pollId: Poll['id']
      ) => Promise<VotingToken[]>;
      updateVotingToken: (
        userSession: UserSession,
        votingToken: Omit<VotingToken, 'createdAt' | 'id' | 'pollId'>
      ) => Promise<VotingToken>;
      removeVotingToken: (
        userSession: UserSession,
        pollId: Poll['id'],
        votingTokenId: VotingToken['id']
      ) => Promise<
        Poll & {
          VotingToken: VotingToken[];
        }
      >;
    };

    publicPolls: {
      getPoll: GetPoll;
      getVotingToken: GetVotingToken;
      voteHandler: VoteHandler;
    };
  }

  interface Session {
    userSession?: UserSession | null;
    verifyGoogleIdToken: (idToken: string) => Promise<LoginTicket>;
  }
}
