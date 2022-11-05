import serverless from 'serverless-http';

import * as dotenv from 'dotenv';
dotenv.config();

import serverlessFunc from '../src/app';

module.exports.handlers = serverless(serverlessFunc);
