/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: [],
    unoptimized: true,
  },
  async redirects() {
    return [
      // Core About Page Aliases & Typos
      { source: '/about-us', destination: '/about', permanent: true },
      { source: '/about_us', destination: '/about', permanent: true },
      { source: '/about-up', destination: '/about', permanent: true },
      { source: '/about_up', destination: '/about', permanent: true },
      { source: '/aboutup', destination: '/about', permanent: true },
      { source: '/aboutus', destination: '/about', permanent: true },
      { source: '/about-hab', destination: '/about', permanent: true },
      { source: '/who-we-are', destination: '/about', permanent: true },

      // Core Programmes Aliases
      { source: '/programs', destination: '/programmes', permanent: true },
      { source: '/program', destination: '/programmes', permanent: true },
      { source: '/our-programs', destination: '/programmes', permanent: true },
      { source: '/our-programmes', destination: '/programmes', permanent: true },
      { source: '/programs/:path*', destination: '/programmes/:path*', permanent: true },
      { source: '/program/:path*', destination: '/programmes/:path*', permanent: true },

      // Contact & Help Aliases
      { source: '/contact-us', destination: '/contact', permanent: true },
      { source: '/contact_us', destination: '/contact', permanent: true },
      { source: '/help', destination: '/contact', permanent: true },

      // Policy & Legal Aliases
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/legal/privacy', destination: '/privacy', permanent: true },
      { source: '/terms-of-service', destination: '/terms', permanent: true },
      { source: '/terms-and-conditions', destination: '/terms', permanent: true },
      { source: '/legal/terms', destination: '/terms', permanent: true },

      // Outlets & Punakha Aliases
      { source: '/punakha', destination: '/outlets/punakha-market', permanent: true },
      { source: '/punakha-outlet', destination: '/outlets/punakha-market', permanent: true },
      { source: '/punakha-market', destination: '/outlets/punakha-market', permanent: true },

      // Membership Aliases
      { source: '/membership-categories', destination: '/membership', permanent: true },
      { source: '/membership-category', destination: '/membership', permanent: true },
      { source: '/join', destination: '/register', permanent: true },
      { source: '/apply', destination: '/membership/apply', permanent: true },

      // Shop & Catalog Aliases
      { source: '/products', destination: '/shop', permanent: true },
      { source: '/catalog', destination: '/shop', permanent: true },
      { source: '/products/:code', destination: '/product/:code', permanent: true },

      // News & Events Aliases
      { source: '/news-events', destination: '/news', permanent: true },
      { source: '/news-and-events', destination: '/news', permanent: true },
      { source: '/events-and-news', destination: '/news', permanent: true },

      // Donation Aliases
      { source: '/donate-now', destination: '/donate', permanent: true },
      { source: '/support-us', destination: '/donate', permanent: true },

      // Directory Aliases
      { source: '/artisan-directory', destination: '/members', permanent: true },
      { source: '/directory', destination: '/members', permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/index.html', destination: '/' },
        { source: '/:path*.html', destination: '/:path*' },
      ],
      // Fallback rewrite: If no public route matches, resolve dynamic CustomPage CMS (/pages/:slug)
      fallback: [
        { source: '/:slug', destination: '/pages/:slug' },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
