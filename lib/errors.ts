export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'DATABASE_ERROR', 500, details);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', 404);
    this.name = 'NotFoundError';
  }
}

export class DatabaseConnectionError extends DatabaseError {
  constructor(message: string = 'Database connection failed', details?: any) {
    super(message, details);
    this.name = 'DatabaseConnectionError';
    this.code = 'DATABASE_CONNECTION_ERROR';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof AppError) {
    throw error;
  }

  // Handle Prisma errors
  if (error instanceof Error) {
    if (error.name === 'PrismaClientKnownRequestError') {
      throw new DatabaseError('Database operation failed', error);
    }

    if (error.name === 'PrismaClientInitializationError') {
      throw new DatabaseConnectionError(
        'Failed to initialize database connection. Please check your database configuration.',
        error
      );
    }

    if (error.name === 'PrismaClientRustPanicError') {
      throw new DatabaseError('A critical database error occurred', error);
    }

    if (error.name === 'PrismaClientUnknownRequestError') {
      throw new DatabaseError('An unexpected database error occurred', error);
    }

    throw new AppError(error.message, 'INTERNAL_ERROR', 500);
  }

  throw new AppError('An unexpected error occurred', 'INTERNAL_ERROR', 500);
}

export function validateRequired<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): void {
  const missingFields = fields.filter((field) => !data[field]);
  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`
    );
  }
}
