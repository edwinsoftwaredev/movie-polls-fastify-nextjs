'use strict';
const cors = require('cors');
const express = require('express');

const helmet = require('helmet');
const { serve } = require('inngest/express');

const { fetchMoviesScheduledJob } = require('./src/services/cronJobs');
const app = express();

// security middlewares
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    "script-src": ["'self'", "'unsafe-inline'"],
  }
}));
app.disable('x-powered-by');
app.use(
  cors({
    origin: [`${process.env.INNGEST_ORIGIN}`],
  })
);

app.use(express.json());

const inngestMiddleware = serve('Movie Polls Jobs', [fetchMoviesScheduledJob]);
app.use(inngestMiddleware);

module.exports = app;
