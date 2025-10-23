/**
 * API Validation Middleware
 *
 * Provides comprehensive input validation and sanitization for API routes
 * with built-in XSS protection and type safety.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { XSSProtection, InputValidator } from "@/lib/utils/input-sanitization";
import { randomBytes } from "crypto";

export interface ValidationConfig {
  schema?: z.ZodSchema;
  sanitize?: boolean;
  maxBodySize?: number;
  allowedMethods?: string[];
  requireAuth?: boolean;
  rateLimitPerMinute?: number;
}

export class ValidationMiddleware {
  /**
   * Create validation middleware
   */
  static create(config: ValidationConfig) {
    return async (request: NextRequest): Promise<NextResponse | null> => {
      // Check allowed methods
      if (
        config.allowedMethods &&
        !config.allowedMethods.includes(request.method)
      ) {
        return NextResponse.json(
          { error: "Method not allowed" },
          { status: 405 }
        );
      }

      // Check content type for POST/PUT requests
      if (["POST", "PUT", "PATCH"].includes(request.method)) {
        const contentType = request.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          return NextResponse.json(
            { error: "Content-Type must be application/json" },
            { status: 400 }
          );
        }
      }

      // Check body size
      if (config.maxBodySize) {
        const contentLength = request.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > config.maxBodySize) {
          return NextResponse.json(
            { error: "Request body too large" },
            { status: 413 }
          );
        }
      }

      // Validate and parse request body
      let body: any = null;
      if (["POST", "PUT", "PATCH"].includes(request.method)) {
        try {
          const rawBody = await request.text();

          // Check for potential XSS in raw JSON
          if (config.sanitize !== false) {
            const sanitizedBody = XSSProtection.sanitizeText(rawBody);
            if (sanitizedBody !== rawBody) {
              return NextResponse.json(
                { error: "Invalid characters in request body" },
                { status: 400 }
              );
            }
          }

          body = JSON.parse(rawBody);
        } catch (error) {
          return NextResponse.json(
            { error: "Invalid JSON in request body" },
            { status: 400 }
          );
        }

        // Schema validation
        if (config.schema) {
          const validated = InputValidator.sanitizeRequestBody(
            body,
            config.schema
          );
          if (!validated) {
            return NextResponse.json(
              { error: "Request validation failed" },
              { status: 400 }
            );
          }
          body = validated;
        }
      }

      // Store validated body in request headers for downstream use
      if (body) {
        const response = NextResponse.next();
        response.headers.set("x-validated-body", JSON.stringify(body));
        return response;
      }

      return null;
    };
  }

  /**
   * Validate query parameters
   */
  static validateQuery(
    request: NextRequest,
    schema: z.ZodSchema
  ): NextResponse | null {
    const { searchParams } = new URL(request.url);
    const queryObject: Record<string, string> = {};

    for (const [key, value] of searchParams.entries()) {
      queryObject[key] = value;
    }

    try {
      const validated = schema.parse(queryObject);
      const response = NextResponse.next();
      response.headers.set("x-validated-query", JSON.stringify(validated));
      return response;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: error.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Query parameter validation failed" },
        { status: 400 }
      );
    }
  }

  /**
   * Sanitize file uploads
   */
  static validateFileUpload(file: File): NextResponse | null {
    // Check file size (default 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedFilename = XSSProtection.sanitizeFilename(file.name);
    if (sanitizedFilename !== file.name) {
      const response = NextResponse.next();
      response.headers.set("x-sanitized-filename", sanitizedFilename);
      return response;
    }

    return null;
  }

  /**
   * Common validation schemas
   */
  static schemas = {
    uuid: z.string().uuid("Invalid UUID format"),
    email: z
      .string()
      .email("Invalid email format")
      .transform((val) => XSSProtection.sanitizeEmail(val)),
    text: z.string().transform((val) => XSSProtection.sanitizeText(val)),
    positiveNumber: z.number().positive("Must be positive"),
    nonNegativeNumber: z.number().nonnegative("Must be non-negative"),
    date: z.string().datetime("Invalid date format"),
    pagination: z.object({
      limit: z.number().int().positive().max(100).optional().default(50),
      offset: z.number().int().nonnegative().optional().default(0),
    }),
    search: z.object({
      q: z
        .string()
        .min(1)
        .max(100)
        .transform((val) => XSSProtection.sanitizeText(val))
        .optional(),
      limit: z.number().int().positive().max(100).optional().default(20),
      offset: z.number().int().nonnegative().optional().default(0),
    }),
  };
}

/**
 * SQL Injection Protection
 */
export class SQLInjectionProtection {
  /**
   * Check for SQL injection patterns
   */
  static detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|EXECUTE)\b)/i,
      /(--|\/\*|\*\/|;|\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(AND|OR)\s+["']?\w+["']?\s*=\s*["']?\w+["']?)/i,
      /(\b(UNION|ALL|SELECT|DISTINCT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET)\b)/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Validate database query parameters
   */
  static validateQueryParams(params: Record<string, any>): boolean {
    for (const [_key, value] of Object.entries(params)) {
      if (typeof value === "string" && this.detectSQLInjection(value)) {
        return false;
      }
    }
    return true;
  }
}

/**
 * Request ID Helper
 */
export class RequestTracker {
  /**
   * Generate unique request ID for tracing
   */
  static generateRequestId(): string {
    return `req_${Date.now()}_${randomBytes(8).toString("hex")}`;
  }

  /**
   * Add request ID to response headers
   */
  static addRequestId(response: NextResponse, requestId: string): void {
    response.headers.set("X-Request-ID", requestId);
    response.headers.set("X-Response-Time", Date.now().toString());
  }
}
