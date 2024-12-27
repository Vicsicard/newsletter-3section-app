import { NextApiResponse } from 'next';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string) {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
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
        message: 'Resource already exists',
      });
    }
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

export const validateEnvVars = () => {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Available environment variables:', Object.keys(process.env));
  }
};
