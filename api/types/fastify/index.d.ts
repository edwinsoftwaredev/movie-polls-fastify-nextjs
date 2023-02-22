import {
  UserSession,
  PrismaClient,
  User,
  Poll,
  MoviePoll,
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
        getUser: (id: string) => Promise<Omit<User, 'id'> | null>;
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
        Array<
          Omit<
            Poll & {
              MoviePolls: MoviePoll[];
            },
            'authorId'
          >
        >
      >;
      getInactivePolls: (userSession: UserSession) => Promise<
        Array<
          Omit<
            Poll & {
              MoviePolls: MoviePoll[];
            },
            'authorId'
          >
        >
      >;
      createPoll: (
        userSession: UserSession,
        pollName: string,
        movieId?: Movie['id']
      ) => Promise<
        Omit<
          Poll & {
            MoviePolls: MoviePoll[];
          },
          'authorId'
        >
      >;
      updatePoll: (
        userSession: UserSession,
        poll: Poll
      ) => Promise<Omit<Poll, 'authorId'>>;
      removePoll: (
        userSession: UserSession,
        pollId: Poll['id']
      ) => Promise<Omit<Poll, 'authorId'>>;
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
    };
  }

  interface Session {
    userSession?: UserSession | null;
    verifyGoogleIdToken: (idToken: string) => Promise<LoginTicket>;
  }
}
