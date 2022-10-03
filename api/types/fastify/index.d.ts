import { Session as UserSession, PrismaClient } from '@prisma/client';
import { RedisClientType } from '@redis/client';
import { OAuth2Client, LoginTicket } from 'google-auth-library';

declare module 'fastify' {
  interface FastifyInstance {
    redisClient: RedisClientType;
    prismaClient: PrismaClient;
    googleOAuth2Client: OAuth2Client;
    verifyGoogleIdToken: (idToken: string) => Promise<LoginTicket>;
  }

  interface Session {
    userSession: UserSession;
    verifyGoogleIdToken: (idToken: string) => Promise<LoginTicket>;
  }
}
