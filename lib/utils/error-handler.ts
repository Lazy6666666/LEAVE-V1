/**
 * Centralized Error Handler for API Routes and Server Actions
 * Provides consistent error responses and logging
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Resource conflict") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT");
    this.name = "RateLimitError";
  }
}

/**
 * Handle API errors and return consistent responses
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("[API Error]", error);

  // Handle known API errors
  if (error instanceof ApiError) {
    const response = {
      error: error.message,
      code: error.code || "INTERNAL_ERROR",
      ...(process.env.NODE_ENV === "development" && {
        stack: error.stack,
        name: error.name,
      }),
    };

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as any;

    switch (prismaError.code) {
      case "P2002":
        return NextResponse.json(
          {
            error: "A record with this value already exists",
            code: "UNIQUE_CONSTRAINT",
            field: prismaError.meta?.target?.[0],
          },
          { status: 409 }
        );

      case "P2025":
        return NextResponse.json(
          {
            error: "Record not found",
            code: "RECORD_NOT_FOUND",
          },
          { status: 404 }
        );

      case "P2003":
        return NextResponse.json(
          {
            error: "Foreign key constraint violation",
            code: "FOREIGN_KEY_CONSTRAINT",
          },
          { status: 400 }
        );

      default:
        return NextResponse.json(
          {
            error: "Database operation failed",
            code: "DATABASE_ERROR",
            ...(process.env.NODE_ENV === "development" && {
              details: prismaError,
            }),
          },
          { status: 500 }
        );
    }
  }

  // Handle Supabase errors
  if (error && typeof error === "object" && "message" in error) {
    const supabaseError = error as any;

    if (supabaseError.message?.includes("JWT")) {
      return NextResponse.json(
        {
          error: "Invalid or expired authentication token",
          code: "INVALID_TOKEN",
        },
        { status: 401 }
      );
    }

    if (supabaseError.message?.includes("permission")) {
      return NextResponse.json(
        {
          error: "Permission denied",
          code: "PERMISSION_DENIED",
        },
        { status: 403 }
      );
    }
  }

  // Handle generic errors
  const message =
    error instanceof Error ? error.message : "Unknown error occurred";

  return NextResponse.json(
    {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "development" ? message : undefined,
    },
    { status: 500 }
  );
}

/**
 * Wrap API route handlers with error handling
 */
export function withErrorHandler(
  handler: (req: Request, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: Request, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      // Log error for monitoring
      await logError(error, req);

      return handleApiError(error);
    }
  };
}

/**
 * Log errors to the database for monitoring
 */
async function logError(error: unknown, req: Request) {
  try {
    const supabase = await createClient();

    const errorData = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      user_agent: req.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    };

    await supabase.from("error_logs").insert(errorData);
  } catch (logError) {
    // If we can't log the error, at least log to console
    console.error("[Failed to log error]", logError);
  }
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, meta?: any): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...meta,
  });
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  message: string,
  statusCode: number = 400,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    },
    { status: statusCode }
  );
}

/**
 * Validate request body against a schema
 */
export function validateRequestBody<T>(
  body: unknown,
  schema: {
    [K in keyof T]: {
      required?: boolean;
      type?: string;
      validator?: (value: any) => boolean;
    };
  }
): T {
  const result = {} as T;

  for (const [key, ruleSet] of Object.entries(schema)) {
    const value = (body as any)?.[key];
    const rules = ruleSet as any;

    if (rules.required && (value === undefined || value === null)) {
      throw new ValidationError(`${key} is required`, key);
    }

    if (value !== undefined) {
      if (rules.type && typeof value !== rules.type) {
        throw new ValidationError(`${key} must be of type ${rules.type}`, key);
      }

      if (rules.validator && !rules.validator(value)) {
        throw new ValidationError(`${key} is invalid`, key);
      }

      (result as any)[key] = value;
    }
  }

  return result;
}
