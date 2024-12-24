declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SUPABASE_URL: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      SUPABASE_ANON_KEY: string;
      OPENAI_API_KEY: string;
      REPLICATE_API_KEY: string;
      BREVO_API_KEY: string;
      BASE_URL: string;
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
    }
  }
}
