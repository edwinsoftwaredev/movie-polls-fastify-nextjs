import { Session as UserSession, PrismaClient } from '@prisma/client';
import { RedisClientType } from '@redis/client';
import type * as Fastify from 'fastify';
import { PassportStatic } from 'passport';

declare module 'fastify' {
  interface FastifyInstance {
    redisClient: RedisClientType;
    prismaClient: PrismaClient;
  }

  interface Session {
    userSession: UserSession;
  }
}
