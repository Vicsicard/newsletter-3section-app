import { createClient } from '@supabase/supabase-js';
import { validateEnvVars } from './errorHandler';

// Validate environment variables but don't throw errors
validateEnvVars();

// Log Supabase configuration (without sensitive data)
console.log('Supabase Configuration:', {
  url: process.env.SUPABASE_URL ? 'Set' : 'Not Set',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not Set',
  anonKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
  nextPublicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set',
  nextPublicAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set'
});

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required Supabase environment variables');
  console.error('Available environment variables:', Object.keys(process.env));
}

// Initialize Supabase client with service role key for admin operations
console.log('Initializing Supabase Admin client...');
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
console.log('Initializing Supabase Public client...');
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Test the connection
export const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase credentials not available:', {
      url: process.env.SUPABASE_URL ? 'Set' : 'Not Set',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not Set'
    });
    return false;
  }

  try {
    console.log('Attempting to query Supabase...');
    console.log('Using URL:', process.env.SUPABASE_URL);
    
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase Connection Error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    
    console.log('Supabase connection successful, found', data?.length || 0, 'companies');
    return true;
  } catch (error) {
    console.error('Supabase Connection Exception:', error);
    return false;
  }
};
