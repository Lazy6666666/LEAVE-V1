/**
 * Standard API Response Format
 *
 * Provides consistent response structure across all API endpoints
 */

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    duration: number;
    pagination?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    };
  };
}

export interface APIError {
  statusCode: number;
  code: string;
  message: string;
  details?: any;
}

/**
 * Creates a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  metadata?: Partial<APIResponse<T>['metadata']>
): Response {
  const response: APIResponse<T> = {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      duration: 0, // Will be set by middleware
      ...metadata,
    },
  };

  return Response.json(response);
}

/**
 * Creates an error API response
 */
export function createErrorResponse(
  statusCode: number,
  code: string,
  message: string,
  details?: any
): Response {
  const response: APIResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      duration: 0, // Will be set by middleware
    },
  };

  return Response.json(response, { status: statusCode });
}

/**
 * Common error codes
 */
export const API_ERROR_CODES = {
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Authorization errors
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Business logic errors
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  LEAVE_CONFLICT: 'LEAVE_CONFLICT',
  CANNOT_APPROVE_OWN_LEAVE: 'CANNOT_APPROVE_OWN_LEAVE',

  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Predefined API errors
 */
export const APIErrors = {
  // 400 Bad Request
  badRequest: (message: string = 'Bad request') =>
    new APIError(400, API_ERROR_CODES.INVALID_INPUT, message),

  validationError: (message: string = 'Validation failed', details?: any) =>
    new APIError(400, API_ERROR_CODES.VALIDATION_ERROR, message, details),

  // 401 Unauthorized
  unauthorized: (message: string = 'Unauthorized') =>
    new APIError(401, API_ERROR_CODES.UNAUTHORIZED, message),

  invalidToken: (message: string = 'Invalid token') =>
    new APIError(401, API_ERROR_CODES.INVALID_TOKEN, message),

  tokenExpired: (message: string = 'Token expired') =>
    new APIError(401, API_ERROR_CODES.TOKEN_EXPIRED, message),

  // 403 Forbidden
  forbidden: (message: string = 'Forbidden') =>
    new APIError(403, API_ERROR_CODES.FORBIDDEN, message),

  insufficientPermissions: (message: string = 'Insufficient permissions') =>
    new APIError(403, API_ERROR_CODES.INSUFFICIENT_PERMISSIONS, message),

  // 404 Not Found
  notFound: (resource: string = 'Resource') =>
    new APIError(404, API_ERROR_CODES.NOT_FOUND, `${resource} not found`),

  // 409 Conflict
  conflict: (message: string = 'Conflict') =>
    new APIError(409, API_ERROR_CODES.CONFLICT, message),

  leaveConflict: (message: string = 'Leave dates conflict with existing leave') =>
    new APIError(409, API_ERROR_CODES.LEAVE_CONFLICT, message),

  insufficientBalance: (message: string = 'Insufficient leave balance') =>
    new APIError(400, API_ERROR_CODES.INSUFFICIENT_BALANCE, message),

  // 500 Internal Server Error
  internalError: (message: string = 'Internal server error') =>
    new APIError(500, API_ERROR_CODES.INTERNAL_ERROR, message),

  databaseError: (message: string = 'Database error') =>
    new APIError(500, API_ERROR_CODES.DATABASE_ERROR, message),
} as const;