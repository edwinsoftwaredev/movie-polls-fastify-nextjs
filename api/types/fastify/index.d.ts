import { UserSession, PrismaClient, User } from '@prisma/client';
import { RedisClientType } from '@redis/client';
import { OAuth2Client, LoginTicket } from 'google-auth-library';

// Importing these type declaration allows the LSP to
// provide methods and properties from them.
// TODO: validate that importing these types
// does not affect builds
//
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html
import type * as FastifySession from '@fastify/session';
import type * as FastifyCsrf from '@fastify/csrf-protection';
import type * as Fastify from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    redisClient: RedisClientType;
    prismaClient: PrismaClient;
    googleOAuth2Client: OAuth2Client;
    verifyGoogleIdToken: (idToken: string) => Promise<LoginTicket>;

    // services
    account: {
      user: {
        getUser: (id: string) => Promise<User | null>;
      };
    };
  }

  interface Session {
    userSession: UserSession;
    verifyGoogleIdToken: (idToken: string) => Promise<LoginTicket>;
  }
}
