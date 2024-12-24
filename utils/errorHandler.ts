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
  console.error('Error details:', error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Supabase specific errors
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    if (code === 'PGRST301') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }
  }

  // Default error response
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { error: String(error) } : {}),
  });
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

  const missingVars = requiredVars.filter(varName => {
    try {
      return !process.env[varName];
    } catch (e) {
      return true;
    }
  });

  if (missingVars.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
  }
};
