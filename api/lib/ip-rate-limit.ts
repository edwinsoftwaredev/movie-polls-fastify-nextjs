import { initRateLimit, CountFn } from './rate-limit';
import { upstashRest } from './upstash';

export default function getIP(request: Request) {
  const xff = request.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0] : '127.0.0.1';
}

export const ipRateLimit = initRateLimit((request) => ({
  id: `ip:${getIP(request)}`,
  count: increment,
  // TODO: change limit for authenticated users
  limit: 250,
  timeframe: 3600 * 24, // limit: 250 reqs per day
}));

const increment: CountFn = async ({ response, key, timeframe }) => {
  // Latency logging
  const start = Date.now();

  const results = await upstashRest(
    [
      ['INCR', key],
      ['EXPIRE', key, timeframe],
    ],
    { pipeline: true }
  );

  // Temporal logging
  const latency = Date.now() - start;
  response.headers.set('x-upstash-latency', `${latency}`);

  return results[0].result;
};
