import { NextRequest, NextResponse } from "next/server";

export interface SecurityHeadersConfig {
  enableCSP?: boolean;
  enableHSTS?: boolean;
  enableXFrameOptions?: boolean;
  enableXContentTypeOptions?: boolean;
  enableReferrerPolicy?: boolean;
  customHeaders?: Record<string, string>;
}

export class SecurityHeadersService {
  private static defaultConfig: SecurityHeadersConfig = {
    enableCSP: true,
    enableHSTS: process.env.NODE_ENV === "production",
    enableXFrameOptions: true,
    enableXContentTypeOptions: true,
    enableReferrerPolicy: true,
  };

  /**
   * Apply security headers to response
   */
  static applySecurityHeaders(
    response: NextResponse,
    config: SecurityHeadersConfig = {}
  ): NextResponse {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Content Security Policy
    if (finalConfig.enableCSP) {
      const csp = this.getCSPHeader();
      response.headers.set("Content-Security-Policy", csp);
    }

    // HTTP Strict Transport Security (HSTS)
    if (finalConfig.enableHSTS) {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }

    // X-Frame-Options
    if (finalConfig.enableXFrameOptions) {
      response.headers.set("X-Frame-Options", "DENY");
    }

    // X-Content-Type-Options
    if (finalConfig.enableXContentTypeOptions) {
      response.headers.set("X-Content-Type-Options", "nosniff");
    }

    // Referrer Policy
    if (finalConfig.enableReferrerPolicy) {
      response.headers.set(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
      );
    }

    // Permissions Policy
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    );

    // Additional security headers
    response.headers.set("X-DNS-Prefetch-Control", "off");
    response.headers.set("X-Download-Options", "noopen");
    response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
    response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

    // Custom headers
    if (finalConfig.customHeaders) {
      Object.entries(finalConfig.customHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  }

  /**
   * Generate CSP header for production
   */
  private static getCSPHeader(): string {
    const isProduction = process.env.NODE_ENV === "production";

    // Stricter CSP for production
    const directives = isProduction ? [
      // Default to self-origin only
      "default-src 'self'",

      // Strict script sources - remove unsafe-inline/eval in production
      "script-src 'self' https://js.stripe.com https://checkout.stripe.com",

      // Style sources with nonce support in production
      "style-src 'self' https://fonts.googleapis.com 'nonce-%CSP_NONCE%'",

      // Font sources
      "font-src 'self' https://fonts.gstatic.com",

      // Image sources
      "img-src 'self' data: blob: https://*.supabase.co",

      // Connect sources for APIs and WebSockets
      "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co",

      // No frames allowed
      "frame-src 'none'",
      "object-src 'none'",

      // Base restrictions
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",

      // Enforce HTTPS
      "upgrade-insecure-requests",

      // Additional security
      "block-all-mixed-content",
      "require-trusted-types-for 'script'",
    ] : [
      // Development CSP - more permissive
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co",
      "connect-src 'self' https://api.stripe.com https://js.stripe.com https://*.supabase.co wss://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ];

    return directives.join("; ");
  }

  /**
   * Generate nonce for inline scripts/styles
   */
  static generateNonce(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
  }

  /**
   * Create security middleware
   */
  static createSecurityMiddleware(config: SecurityHeadersConfig = {}) {
    return () => {
      const response = NextResponse.next();
      return this.applySecurityHeaders(response, config);
    };
  }

  /**
   * Validate CORS origin
   */
  static validateOrigin(
    request: NextRequest,
    allowedOrigins: string[]
  ): boolean {
    const origin = request.headers.get("origin");

    if (!origin) return true; // Same-origin request

    return allowedOrigins.includes(origin) || allowedOrigins.includes("*");
  }

  /**
   * Create CORS middleware
   */
  static createCORSMiddleware(
    allowedOrigins: string[] = ["http://localhost:3000"]
  ) {
    return (request: NextRequest) => {
      const origin = request.headers.get("origin");
      const isAllowed = this.validateOrigin(request, allowedOrigins);

      // Handle preflight requests
      if (request.method === "OPTIONS") {
        const response = new NextResponse(null, { status: 200 });

        if (isAllowed && origin) {
          response.headers.set("Access-Control-Allow-Origin", origin);
        }

        response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        response.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        response.headers.set("Access-Control-Max-Age", "86400");
        response.headers.set("Vary", "Origin");

        return response;
      }

      // Handle actual requests
      const response = NextResponse.next();

      if (isAllowed && origin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Vary", "Origin");
      }

      response.headers.set("Access-Control-Allow-Credentials", "true");

      return response;
    };
  }
}
