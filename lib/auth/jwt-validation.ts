import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  aal?: string;
  amr?: Array<{
    method: string;
    timestamp: number;
  }>;
  [key: string]: any; // Allow additional properties
}

export class JWTValidationService {
  private static instance: JWTValidationService;
  private jwtSecret: string;
  private supabase = createClient();

  constructor() {
    // Use Supabase JWT secret
    this.jwtSecret =
      process.env.SUPABASE_JWT_SECRET ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";
    if (!this.jwtSecret) {
      throw new Error("JWT secret not configured");
    }
  }

  static getInstance(): JWTValidationService {
    if (!JWTValidationService.instance) {
      JWTValidationService.instance = new JWTValidationService();
    }
    return JWTValidationService.instance;
  }

  /**
   * Validate JWT token from Authorization header
   */
  async validateTokenFromHeader(
    authHeader?: string
  ): Promise<JWTPayload | null> {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    return this.validateToken(token);
  }

  /**
   * Validate JWT token from cookie
   */
  async validateTokenFromCookie(): Promise<JWTPayload | null> {
    const cookieStore = cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) {
      return null;
    }

    return this.validateToken(token);
  }

  /**
   * Type guard function to check if payload is valid JWTPayload
   */
  private isValidJWTPayload(payload: any): payload is JWTPayload {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      typeof payload.sub === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string' &&
      typeof payload.exp === 'number'
    );
  }

  /**
   * Validate and decode JWT token
   */
  private async validateToken(token: string): Promise<JWTPayload | null> {
    try {
      // Create JWT verification key
      const secretKey = new TextEncoder().encode(this.jwtSecret);

      // Verify and decode token
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
      });

      // Type guard check
      if (!this.isValidJWTPayload(payload)) {
        console.error("Invalid JWT payload structure");
        return null;
      }

      // Check if token is expired
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      // Get user profile to verify role
      const { data: profile } = await this.supabase
        .from("profiles")
        .select("role")
        .eq("id", payload.sub)
        .single();

      if (!profile) {
        return null;
      }

      // Add role from database to payload
      return {
        ...payload,
        role: profile.role,
      } as JWTPayload;
    } catch (error) {
      console.error("JWT validation error:", error);
      return null;
    }
  }

  /**
   * Check if user has required role
   */
  async hasRole(payload: JWTPayload, requiredRole: string): Promise<boolean> {
    const roleHierarchy = {
      ADMIN: 4,
      HR: 3,
      MANAGER: 2,
      EMPLOYEE: 1,
    };

    const userRoleLevel =
      roleHierarchy[payload.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel =
      roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }

  /**
   * Check if user has AAL2 (Authenticator Assurance Level 2)
   */
  hasAAL2(payload: JWTPayload): boolean {
    return payload.aal === "aal2";
  }

  /**
   * Check if user used MFA for authentication
   */
  usedMFA(payload: JWTPayload): boolean {
    if (!payload.amr || payload.amr.length === 0) {
      return false;
    }

    // Check if the most recent authentication method was MFA
    const mostRecentAuth = payload.amr.sort(
      (a, b) => b.timestamp - a.timestamp
    )[0];

    return (
      mostRecentAuth.method === "totp" || mostRecentAuth.method === "phone"
    );
  }

  /**
   * Middleware for API route protection
   */
  createAuthMiddleware(options: {
    requiredRole?: string;
    requireMFA?: boolean;
  }) {
    return async (request: Request) => {
      const authHeader = request.headers.get("authorization");
      const payload = await this.validateTokenFromHeader(
        authHeader || undefined
      );

      if (!payload) {
        return {
          success: false,
          error: "Unauthorized",
          status: 401,
        };
      }

      // Check role requirements
      if (
        options.requiredRole &&
        !this.hasRole(payload, options.requiredRole)
      ) {
        return {
          success: false,
          error: "Insufficient permissions",
          status: 403,
        };
      }

      // Check MFA requirements
      if (options.requireMFA && !this.hasAAL2(payload)) {
        return {
          success: false,
          error: "MFA required",
          status: 403,
        };
      }

      return {
        success: true,
        payload,
      };
    };
  }
}

// Helper function for JWT verification
async function jwtVerify(token: string, secret: Uint8Array, options: any): Promise<{ payload: any }> {
  try {
    const { jwtVerify } = await import("jose");
    return await jwtVerify(token, secret, options);
  } catch {
    // Fallback to node-jose if jose is not available
    const nodeJose = await import("node-jose");
    const key = await nodeJose.JWK.asKey(secret);
    const result = await nodeJose.JWS.createVerify(key).verify(token);
    return { payload: result.payload };
  }
}
