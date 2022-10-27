import * as dotenv from 'dotenv';
dotenv.config();

import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverlessFunc from '../src/server';
import Fastify from 'fastify';

const app = Fastify({
  logger: true
});

app.register(serverlessFunc);

export default async (req: VercelRequest, res: VercelResponse) => {
  await app.ready();
  app.server.emit('request', req, res);
}
