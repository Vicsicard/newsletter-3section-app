import { createClient } from '@supabase/supabase-js';
import { validateEnvVars } from './errorHandler';

// Validate environment variables but don't throw errors
validateEnvVars();

// Initialize Supabase client with service role key for admin operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Initialize Supabase client with anon key for public operations
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Test the connection
export const testSupabaseConnection = async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase credentials not available');
    return false;
  }

  try {
    const { data, error } = await supabaseAdmin.from('health_check').select('*').limit(1);
    if (error) {
      console.error('Supabase Error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return false;
  }
};
