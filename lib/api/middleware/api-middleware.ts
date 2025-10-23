/**
 * API Middleware
 *
 * Provides common middleware functionality for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, APIErrors } from '../api-response';

/**
 * Middleware to measure request duration
 */
export function withTiming(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    const start = Date.now();

    try {
      const response = await handler(req);
      const duration = Date.now() - start;

      // Add timing to response headers
      response.headers.set('x-response-time', `${duration}ms`);

      // If the response is JSON, update the metadata
      if (response.headers.get('content-type')?.includes('application/json')) {
        const cloned = response.clone();
        const data = await cloned.json();

        if (data.metadata) {
          data.metadata.duration = duration;

          // Create new response with updated metadata
          return new Response(JSON.stringify(data), {
            status: response.status,
            headers: response.headers,
          });
        }
      }

      return response;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`API Error after ${duration}ms:`, error);

      return createErrorResponse(
        500,
        'INTERNAL_ERROR',
        'Internal server error',
        { duration }
      );
    }
  };
}

/**
 * Middleware to handle CORS
 */
export function withCors(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    const response = await handler(req);

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  };
}

/**
 * Middleware to add security headers
 */
export function withSecurityHeaders(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    const response = await handler(req);

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
  };
}

/**
 * Middleware to handle errors globally
 */
export function withErrorHandling(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('Unhandled API Error:', error);

      // Handle known API errors
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const apiError = error as { statusCode: number; code: string; message: string };
        return createErrorResponse(
          apiError.statusCode,
          apiError.code,
          apiError.message
        );
      }

      // Handle unknown errors
      return createErrorResponse(
        500,
        'INTERNAL_ERROR',
        'Internal server error'
      );
    }
  };
}

/**
 * Compose multiple middleware
 */
export function composeMiddleware(
  ...middlewares: Array<(handler: (req: NextRequest) => Promise<Response>) => (req: NextRequest) => Promise<Response>>
) {
  return (handler: (req: NextRequest) => Promise<Response>) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * Apply common middleware to API routes
 */
export const withAPIMiddleware = composeMiddleware(
  withErrorHandling,
  withTiming,
  withCors,
  withSecurityHeaders
);