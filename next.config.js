/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  api: {
    bodyParser: false,
    externalResolver: true,
  },
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          { key: 'X-Accel-Buffering', value: 'no' },
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
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  serverRuntimeConfig: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  publicRuntimeConfig: {
    apiTimeout: 60000,
  },
};

module.exports = nextConfig;
