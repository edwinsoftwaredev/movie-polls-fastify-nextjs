import dotenv from 'dotenv'
dotenv.config({ path: '../.env' }) // update to dotenvx

import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverlessFunc from '../src/server';
import Fastify from 'fastify';

const app = Fastify({
  logger: true,
  trustProxy: 1,
});

app.register(serverlessFunc);

// In the case where the application is not running as
// a serverless function, a server has to be spawned.
if (require.main === module) {
  const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 8080;
  app.listen({ port }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit();
    }
  });
}

export default async (req: VercelRequest, res: VercelResponse) => {
  await app.ready();
  app.server.emit('request', req, res);
};
