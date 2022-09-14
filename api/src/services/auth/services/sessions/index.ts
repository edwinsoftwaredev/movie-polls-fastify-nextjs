import { FastifyPluginAsync } from "fastify";
import csrfToken from "./plugins/csrf-token";
import session from "./plugins/session";

const sessions: FastifyPluginAsync = async (fastify) => {
  fastify.redisClient;
  fastify.prismaClient;

  fastify.register(session);
  fastify.register(csrfToken);
};

export default sessions;
