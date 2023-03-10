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

export type GetUser = ReturnType<typeof getUser>;
