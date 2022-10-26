import type { VercelRequest, VercelResponse } from "@vercel/node";
import Fastify from "fastify";

import * as dotenv from 'dotenv';
dotenv.config();

const app = Fastify({
  logger: true
});

app.register(require("../src/server"));

export default async (req: VercelRequest, res: VercelResponse) => {
  await app.ready();
  app.server.emit('request', req, res);
}
