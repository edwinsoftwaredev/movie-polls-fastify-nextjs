import cors from 'cors';
import express from 'express';

import helmet from 'helmet';

import { serve } from 'inngest/express';
import { fetchMoviesScheduledJob } from './src/services/cronJobs';
const app = express();

// security middlewares
app.use(helmet());
app.disable('x-powered-by');
app.use(
  cors({
    origin: [`${process.env.INNGEST_ORIGIN}`],
  })
);

app.use(express.json());

const inngestMiddleware = serve('Movie Polls Jobs', [fetchMoviesScheduledJob]);
app.use('/api/inngest', inngestMiddleware);

export default app;
