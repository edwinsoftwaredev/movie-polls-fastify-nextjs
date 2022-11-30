// const path = require("path");

// https://nextjs.org/docs/advanced-features/security-headers
// https://helmetjs.github.io/

const apiURL = process.env.NEXT_PUBLIC_API_HOST_URL || '';
// https://cloud.google.com/identity-platform/docs/web/chrome-extension
const googleURLs = 'https://accounts.google.com';

const googleFontsURL = 'https://fonts.googleapis.com https://fonts.gstatic.com';

const vercelInsights = 'https://vitals.vercel-insights.com';

const TMDBImagesUrl = 'https://image.tmdb.org';

// TODO: review headers in prod
const ContentSecurityPolicy = `
  base-uri 'self';
  default-src 'self';
  script-src 'self' ${googleURLs} 'unsafe-eval' 'unsafe-inline';
  connect-src 'self' ${apiURL} ${vercelInsights};
  child-src 'self';
  frame-src 'self' ${googleURLs};
  frame-ancestors 'self';
  style-src 'self' ${googleURLs} ${googleFontsURL} 'unsafe-inline';
  font-src 'self' ${googleFontsURL};
  img-src 'self' ${TMDBImagesUrl} data:;
  form-action 'self' ${apiURL};
  object-src 'none';
  script-src-attr 'none';
  upgrade-insecure-requests 
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups', // allow-popups will allow the Google Sign In With Pop Up to render
  },
  {
    key: 'Origin-Agent-Cluster',
    value: '?1',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Permitted-Cross-Domain-Policies',
    value: 'none',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=15552000; includeSubDomains',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      resourceQuery: { not: [/url/] },
      use: ['@svgr/webpack'],
    });
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    appDir: true,
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin'] } },
    ],
  },
};

module.exports = nextConfig;
