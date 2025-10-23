import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export interface CSRFConfig {
  enabled: boolean;
  cookieName: string;
  headerName: string;
  tokenLength: number;
  maxAge: number;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  excludePaths: string[];
}

export class CSRFProtection {
  private static defaultConfig: CSRFConfig = {
    enabled: process.env.NODE_ENV === "production",
    cookieName: "csrf-token",
    headerName: "x-csrf-token",
    tokenLength: 32,
    maxAge: 60 * 60 * 24, // 24 hours
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    excludePaths: ["/api/auth/", "/api/webhooks/", "/health", "/metrics"],
  };

  /**
   * Generate CSRF token
   */
  private static generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Generate secure token based on session
   */
  private static generateSessionBasedToken(sessionId: string): string {
    const secret =
      process.env.CSRF_SECRET || "default-csrf-secret-change-in-production";
    const timestamp = Date.now().toString();
    const data = `${sessionId}:${timestamp}`;

    return crypto.createHmac("sha256", secret).update(data).digest("hex");
  }

  /**
   * Verify CSRF token
   */
  private static verifyToken(token: string, expectedToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token, "hex"),
      Buffer.from(expectedToken, "hex")
    );
  }

  /**
   * Get or create CSRF token
   */
  static async getCSRFToken(
    request: NextRequest,
    config: Partial<CSRFConfig> = {}
  ): Promise<string> {
    const finalConfig = { ...this.defaultConfig, ...config };

    if (!finalConfig.enabled) {
      return "disabled";
    }

    // Check if token exists in cookies
    const existingToken = request.cookies.get(finalConfig.cookieName)?.value;

    if (existingToken) {
      return existingToken;
    }

    // Generate new token
    const newToken = this.generateToken();

    return newToken;
  }

  /**
   * Set CSRF token cookie
   */
  static setCSRFToken(
    response: NextResponse,
    token: string,
    config: Partial<CSRFConfig> = {}
  ): void {
    const finalConfig = { ...this.defaultConfig, ...config };

    if (!finalConfig.enabled) {
      return;
    }

    response.cookies.set(finalConfig.cookieName, token, {
      httpOnly: false, // Must be readable by JavaScript
      secure: finalConfig.secure,
      sameSite: finalConfig.sameSite,
      maxAge: finalConfig.maxAge,
      path: "/",
    });
  }

  /**
   * Validate CSRF token for state-changing requests
   */
  static validateCSRFToken(
    request: NextRequest,
    config: Partial<CSRFConfig> = {}
  ): boolean {
    const finalConfig = { ...this.defaultConfig, ...config };

    if (!finalConfig.enabled) {
      return true;
    }

    // Skip CSRF validation for excluded paths
    const pathname = request.nextUrl.pathname;
    if (finalConfig.excludePaths.some((path) => pathname.startsWith(path))) {
      return true;
    }

    // Skip for safe methods
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    if (safeMethods.includes(request.method)) {
      return true;
    }

    // Get token from header
    const headerToken = request.headers.get(finalConfig.headerName);

    // Get token from cookie
    const cookieToken = request.cookies.get(finalConfig.cookieName)?.value;

    if (!headerToken || !cookieToken) {
      return false;
    }

    // Verify tokens match
    return this.verifyToken(headerToken, cookieToken);
  }

  /**
   * Create CSRF middleware
   */
  static createCSRFMiddleware(config: Partial<CSRFConfig> = {}) {
    const finalConfig = { ...this.defaultConfig, ...config };

    return (
      request: NextRequest
    ): { valid: boolean; response?: NextResponse } => {
      if (!finalConfig.enabled) {
        return { valid: true };
      }

      const isValid = this.validateCSRFToken(request, finalConfig);

      if (!isValid) {
        const response = NextResponse.json(
          { error: "CSRF token validation failed" },
          { status: 403 }
        );

        return { valid: false, response };
      }

      return { valid: true };
    };
  }

  /**
   * Middleware for API routes
   */
  static async apiCSRFMiddleware(
    request: NextRequest,
    config: Partial<CSRFConfig> = {}
  ): Promise<NextResponse | null> {
    const finalConfig = { ...this.defaultConfig, ...config };

    if (!finalConfig.enabled) {
      return null;
    }

    const isValid = this.validateCSRFToken(request, finalConfig);

    if (!isValid) {
      return NextResponse.json(
        { error: "CSRF token validation failed" },
        { status: 403 }
      );
    }

    return null;
  }

  /**
   * Generate CSRF token for client-side
   */
  static async generateClientToken(
    sessionId: string,
    config: Partial<CSRFConfig> = {}
  ): Promise<{
    token: string;
    headerName: string;
    cookieName: string;
  }> {
    const finalConfig = { ...this.defaultConfig, ...config };

    if (!finalConfig.enabled) {
      return {
        token: "disabled",
        headerName: finalConfig.headerName,
        cookieName: finalConfig.cookieName,
      };
    }

    const token = this.generateSessionBasedToken(sessionId);

    return {
      token,
      headerName: finalConfig.headerName,
      cookieName: finalConfig.cookieName,
    };
  }

  /**
   * Validate CSRF token with session
   */
  static async validateSessionToken(
    token: string,
    sessionId: string,
    config: Partial<CSRFConfig> = {}
  ): Promise<boolean> {
    const finalConfig = { ...this.defaultConfig, ...config };

    if (!finalConfig.enabled) {
      return true;
    }

    const expectedToken = this.generateSessionBasedToken(sessionId);
    return this.verifyToken(token, expectedToken);
  }

  /**
   * Get CSRF configuration for client
   */
  static getClientConfig(config: Partial<CSRFConfig> = {}): {
    enabled: boolean;
    headerName: string;
    cookieName: string;
  } {
    const finalConfig = { ...this.defaultConfig, ...config };

    return {
      enabled: finalConfig.enabled,
      headerName: finalConfig.headerName,
      cookieName: finalConfig.cookieName,
    };
  }
}

/**
 * CSRF protection middleware function
 */
export async function withCSRFProtection(
  request: NextRequest,
  config: Partial<CSRFConfig> = {}
): Promise<{ valid: boolean; response?: NextResponse }> {
  const middleware = CSRFProtection.createCSRFMiddleware(config);
  return middleware(request);
}

/**
 * API endpoint CSRF protection
 */
export async function protectAPIRoute(
  request: NextRequest,
  config: Partial<CSRFConfig> = {}
): Promise<NextResponse | null> {
  return await CSRFProtection.apiCSRFMiddleware(request, config);
}
