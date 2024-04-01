import { ipAddress, next } from '@vercel/edge';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const rateLimitMovieDetails = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(250, '1 d'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.tokenBucket(1000, '1 m', 1000),
});

export const config = {
  runtime: 'edge',
  regions: ['iad1'], // regions that will execute the requests
};

const getRateLimitExceededHeaders = (
  limit: number,
  remaining: number,
  reset: number
) => ({
  status: 429,
  headers: {
    'X-RateLimit-Limit': `${limit}`,
    'X-RateLimit-Remaining': `${remaining}`,
    'X-RateLimit-Reset': `${reset}`,
    'Content-Type': 'application/json',
  },
});

const getRateLimitExceededBody = (ip?: string) => {
  if (ip)
    return JSON.stringify({
      error: { message: `API rate limit exceeded for ${ip}` },
    });
  return JSON.stringify({ error: { message: 'too many requests' } });
};

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const ip = ipAddress(req) || '127.0.0.1';

  if (
    url.pathname.startsWith(
      '/trpc/publicMoviesRoutes/publicMovies.movieDetails'
    )
  ) {
    // TODO: consider device fingerprinting
    const { success, limit, reset, remaining } =
      await rateLimitMovieDetails.limit(ip);

    if (!success) {
      return new Response(
        getRateLimitExceededBody(ip),
        getRateLimitExceededHeaders(limit, remaining, reset)
      );
    }
  }

  const identifier = 'api';
  const { success, limit, reset, remaining } = await rateLimit.limit(
    identifier
  );

  if (!success) {
    return new Response(
      getRateLimitExceededBody(),
      getRateLimitExceededHeaders(limit, remaining, reset)
    );
  }

  // NOTE: do not set headers with sensitive information
  // in an Edge function.
  return next({
    headers: {
      'x-from-middleware': '1',
    },
  });
}
