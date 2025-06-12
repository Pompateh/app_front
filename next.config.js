/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'wearenewstalgia.com',
      'app-back-gc64.onrender.com',
      'res.cloudinary.com',
    ],
    unoptimized: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        http: false,
        https: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        url: false,
        zlib: false,
        path: false,
        util: false,
        assert: false,
        constants: false,
      };
    }
    return config;
  },
  // Disable static export map to enable proper dynamic SSR
  // output: 'standalone' is fine
  output: 'standalone',
  distDir: '.next',
  trailingSlash: false,
  // Set the base URL for the application
  assetPrefix: 'https://wearenewstalgia.com',
  basePath: '',
  async rewrites() {
    return [
      {
        source: '/admin/dashboard',
        destination: '/admin/dashboard',
      },
      {
        source: '/admin/login',
        destination: '/admin/login',
      },
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
  // Add custom headers to handle CORS and other security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
