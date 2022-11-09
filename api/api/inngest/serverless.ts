import serverless from 'serverless-http';

import * as dotenv from 'dotenv';
dotenv.config();

import serverlessFunc from 'jobs';

if (require.main === module) {
  const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 8080;
  serverlessFunc.listen(port);
}

module.exports.handlers = serverless(serverlessFunc);
