import { createClient } from '@supabase/supabase-js';
import { validateEnvVars } from './errors';

// Validate environment variables but don't throw errors
validateEnvVars();

// Log Supabase configuration (without sensitive data)
console.log('Supabase Configuration:', {
  nextPublicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set',
  nextPublicAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not Set'
});

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required Supabase environment variables');
  console.error('Available environment variables:', Object.keys(process.env));
}

// Initialize Supabase client with service role key for admin operations
console.log('Initializing Supabase Admin client...');
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Initialize Supabase client with anon key for public operations
console.log('Initializing Supabase Public client...');
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

// Test the connection
export const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required Supabase environment variables');
    return false;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('count')
      .limit(0);

    if (error) {
      console.error('Supabase connection test error:', error);
      return false;
    }

    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};
