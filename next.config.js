/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  cacheHandler: require.resolve('./cache-handler.js'),
  cacheMaxMemorySize: 0, // Disable default in-memory caching
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
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    BASE_URL: process.env.BASE_URL,
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
