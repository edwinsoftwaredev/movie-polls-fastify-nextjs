import { next, rewrite } from '@vercel/edge';
import { ipRateLimit } from '../lib/ip-rate-limit';

export const config = {
  // matcher: ['/trpc/publicMoviesRoutes/:path*'],
  runtime: 'edge',
  // regions: ['iad1'], // only execute this function on iad1
};

export default async (req: Request) => {
  const url = new URL(req.url);

  console.log(url);

  if (url.pathname.startsWith('/trpc/publicMoviesRoutes/')) {
    // TODO: consider device fingerprinting
    const ipRateLimitRes = await ipRateLimit(req);

    // If the status is not 200 then it has been rate limited.
    if (ipRateLimitRes.status !== 200) return ipRateLimitRes;
  }

  return next({
    headers: { 'x-from-middleware': '1' },
  });
};
