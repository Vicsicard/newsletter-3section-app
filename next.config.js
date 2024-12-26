/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  generateBuildId: async () => {
    // You can replace this with a git hash or any other unique identifier
    return `build-${Date.now()}`;
  },
  headers: async () => {
    return [
      {
        source: '/:path*{/}?',
        headers: [
          {
            key: 'X-Accel-Buffering',
            value: 'no',
          },
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  experimental: {
    // This will help with environment variables during build
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // Configure API routes
  serverRuntimeConfig: {
    // Will only be available on the server side
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    apiTimeout: 30000,
  },
};

module.exports = nextConfig;
