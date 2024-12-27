/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  serverRuntimeConfig: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  publicRuntimeConfig: {
    apiTimeout: 60000,
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
  experimental: {
    instrumentationHook: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    REPLICATE_API_KEY: process.env.REPLICATE_API_KEY,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BASE_URL: process.env.BASE_URL,
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
  },
  images: {
    domains: ['oaidalleapiprodscus.blob.core.windows.net', 'replicate.delivery'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
