import { UserSession } from '@prisma/client';
import { FastifyInstance } from 'fastify';

// TODO: exception handling
export const getUser = (fastify: FastifyInstance) => async (id: string) =>
  fastify.prismaClient.user.findUnique({
    where: {
      id,
    },
    // TODO: update
    select: {
      displayName: true,
      email: true,
      emailVerified: true,
      picture: true,
      id: true,
    },
  });

export const deleteAccount =
  (fastify: FastifyInstance) => async (userSession: UserSession) =>
    fastify.prismaClient.user.delete({
      where: {
        id: userSession.userId!,
      },
    });

export type GetUser = ReturnType<typeof getUser>;
export type DeleteAccount = ReturnType<typeof deleteAccount>;
