import { onRequest } from 'firebase-functions/v2/https';
import { Inngest } from 'inngest';
import { serve } from 'inngest/next';
import fetchMovies from '../../src/fetch-movies';

const inngest = new Inngest({ name: 'Movie-Polls' });

export default onRequest(
  {
    secrets: ['DOPPLER_URL', 'INNGEST_EVENT_KEY', 'INNGEST_SIGNING_KEY'],
  },
  serve(inngest, [
    inngest.createFunction(
      { name: 'fetch-movies' },
      { cron: '0 12 * * *' },
      async ({}) => {
        return await fetchMovies()
          .then((status) => ({
            status: 200,
            body: `${status}`,
          }))
          .catch((status) => ({
            status: 500,
            body: `${status}`,
          }));
      }
    ),
  ])
);
