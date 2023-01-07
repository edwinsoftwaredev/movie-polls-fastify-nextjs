import { next } from '@vercel/edge';
import { ipRateLimit } from './vercel/ip-rate-limt';

export const config = {
  matcher: ['/publicMoviesRoutes/:path*'],
  runtime: 'edge',
  regions: ['iad1'], // only execute this function on iad1
};

export default async (req: Request) => {
  // TODO: consider device fingerprinting
  const ipRateLimitRes = await ipRateLimit(req);
  // If the status is not 200 then it has been rate limited.
  if (ipRateLimitRes.status !== 200) return ipRateLimitRes;

  return next({
    headers: { 'x-from-middleware': 'true' },
  });
};
