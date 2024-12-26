import { NextApiResponse } from 'next';

export class ApiError extends Error {
  public readonly statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const handleError = (error: unknown, res: NextApiResponse) => {
  console.error('Error details:', {
    error,
    type: error instanceof Error ? error.constructor.name : typeof error,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Supabase specific errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message?: string; details?: string };
    console.error('Supabase error:', {
      code: supabaseError.code,
      message: supabaseError.message,
      details: supabaseError.details
    });

    if (supabaseError.code === 'PGRST301') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    if (supabaseError.code === '42P01') {
      return res.status(500).json({
        success: false,
        message: 'Database table not found',
      });
    }

    if (supabaseError.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Duplicate record',
      });
    }
  }

  // Default error response
  const errorResponse = {
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? {
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    } : {})
  };

  console.error('Sending error response:', errorResponse);
  return res.status(500).json(errorResponse);
};

export const validateEnvVars = () => {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
    'REPLICATE_API_KEY',
    'BREVO_API_KEY',
    'BASE_URL'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
  }

  const envVars = requiredVars.reduce((acc, varName) => ({
    ...acc,
    [varName]: process.env[varName] ? 'Set' : 'Not Set'
  }), {});

  console.log('Environment variables status:', envVars);
};
