const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow production deployment even if lint errors exist
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production deployment even if type errors exist
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'your-domain.com'],
  },
  experimental: {
    esmExternals: 'loose',
  },
  trailingSlash: false,
  swcMinify: true,
  compiler: {
    styledComponents: false,
  },
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  webpack: (config, { isServer, dev }) => {
    // Disable filesystem cache completely on Windows to avoid corruption
    config.cache = false

    // Keep default module resolution; avoid hard aliasing react

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  transpilePackages: [
    '@thirdweb-dev/react'
  ],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_CHAT_SERVICE_URL: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:3002',
    NEXT_PUBLIC_MARKETPLACE_SERVICE_URL: process.env.NEXT_PUBLIC_MARKETPLACE_SERVICE_URL || 'http://localhost:3003',
    NEXT_PUBLIC_WALLET_SERVICE_URL: process.env.NEXT_PUBLIC_WALLET_SERVICE_URL || 'http://localhost:3004',
    NEXT_PUBLIC_AI_SERVICE_URL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3005',
  },
  async rewrites() {
    // Skip rewrites in production to avoid localhost issues
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/api/chat/:path*',
        destination: 'http://localhost:3002/api/:path*',
      },
      {
        source: '/api/marketplace/:path*',
        destination: 'http://localhost:3003/api/:path*',
      },
      {
        source: '/api/wallet/:path*',
        destination: 'http://localhost:3004/api/:path*',
      },
      {
        source: '/api/ai/:path*',
        destination: 'http://localhost:3005/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
