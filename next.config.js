/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: [],
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/index.html', destination: '/' },
      { source: '/:path*.html', destination: '/:path*' },
    ];
  },
};

module.exports = nextConfig;
