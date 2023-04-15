// const path = require("path");

// https://nextjs.org/docs/advanced-features/security-headers
// https://helmetjs.github.io/

// TODO: review headers in prod
const ContentSecurityPolicy = `
  base-uri 'self';
  default-src 'self';
  script-src 'self';
  connect-src 'self';
  child-src 'self';
  frame-src 'self';
  frame-ancestors 'self';
  style-src 'self';
  font-src 'self';
  img-src 'self';
  form-action 'self';
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
  swcMinify: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
