/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['wearenewstalgia.com', 'app-back-gc64.onrender.com', 'res.cloudinary.com', 'images.unsplash.com'],
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
  // Only include pages that should be built
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Disable static generation for dynamic routes
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/studio': { page: '/studio' },
      '/admin/projects': { page: '/admin/projects' },
      '/admin/posts': { page: '/admin/posts' },
    };
  },
  // Add trailing slash to ensure proper static file serving
  trailingSlash: true,
};

module.exports = nextConfig;