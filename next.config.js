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
    // Exclude API directory from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    return config;
  },
  // Disable static export map to enable proper dynamic SSR
  // output: 'standalone' is fine
  output: 'standalone',
  distDir: '.next',
  trailingSlash: false,
  assetPrefix: '',
  basePath: '',
};

module.exports = nextConfig;
