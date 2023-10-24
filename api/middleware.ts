import { ipAddress, next } from '@vercel/edge';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(250, '1 d'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

export const config = {
  // TODO: should be /trpc/publicMoviesRoutes/publicMovies.movieDetails
  matcher: ['/trpc/publicMoviesRoutes/:path*', '/trpc/publicPollRoutes/:path*'],
  runtime: 'edge',
  regions: ['iad1'], // only execute this function on iad1
};

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const ip = ipAddress(req) || '127.0.0.1';

  if (url.pathname.startsWith('/trpc/publicMoviesRoutes/')) {
    // TODO: consider device fingerprinting
    const { success, limit, reset, remaining } = await rateLimit.limit(ip);

    if (!success) {
      const res = new Response(
        JSON.stringify({
          error: { message: `API rate limit exceeded for ${ip}` },
        }),
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': `${limit}`,
            'X-RateLimit-Remaining': `${remaining}`,
            'X-RateLimit-Reset': `${reset}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return res;
    }
  }

  // NOTE: do not set headers with sensitive information
  // in an Edge function.
  return next({
    headers: {
      'x-from-middleware': '1',
    },
  });
}
