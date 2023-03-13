import { next } from '@vercel/edge';
import { ipRateLimit } from './lib/ip-rate-limit';

export const config = {
  // TODO: should be /trpc/publicMoviesRoutes/publicMovies.movieDetails
  matcher: ['/trpc/publicMoviesRoutes/:path*', '/trpc/publicPollRoutes/:path*'],
  runtime: 'edge',
  regions: ['iad1'], // only execute this function on iad1
};

export default async function middleware(req: Request) {
  const url = new URL(req.url);

  if (url.pathname.startsWith('/trpc/publicMoviesRoutes/')) {
    // TODO: consider device fingerprinting
    const ipRateLimitRes = await ipRateLimit(req);

    // If the status is not 200 then it has been rate limited.
    if (ipRateLimitRes.status !== 200) return ipRateLimitRes;
  }

  // NOTE: do not set headers with sensitive information
  // in an Edge function.
  return next({
    headers: {
      'x-from-middleware': '1',
    },
  });
}
