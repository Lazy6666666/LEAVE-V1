import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { MFAService } from "@/lib/services/mfa";

export interface MFAMiddlewareOptions {
  requireMFA?: boolean;
  bypassRoles?: string[];
  excludePaths?: string[];
}

export class MFAMiddleware {
  private static defaultOptions: MFAMiddlewareOptions = {
    requireMFA: true,
    bypassRoles: ["EMPLOYEE"], // Employees don't need MFA by default
    excludePaths: ["/admin/security/mfa", "/admin/settings", "/api/admin/mfa"],
  };

  /**
   * Create MFA verification middleware
   */
  static createMFAMiddleware(options: MFAMiddlewareOptions = {}) {
    const finalOptions = { ...this.defaultOptions, ...options };

    return async (request: NextRequest) => {
      const { pathname } = request.nextUrl;

      // Skip MFA check for excluded paths
      if (
        finalOptions.excludePaths?.some((path) => pathname.startsWith(path))
      ) {
        return { valid: true };
      }

      // Only apply to admin routes
      if (
        !pathname.startsWith("/admin") &&
        !pathname.startsWith("/api/admin")
      ) {
        return { valid: true };
      }

      // Skip for non-admin roles
      const userRole = request.headers.get("x-user-role");
      if (userRole && finalOptions.bypassRoles?.includes(userRole)) {
        return { valid: true };
      }

      // Skip if MFA is not required
      if (!finalOptions.requireMFA) {
        return { valid: true };
      }

      try {
        const supabase = createClient();
        const mfaService = new MFAService();

        // Get current user session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          return {
            valid: false,
            error: "Authentication required",
            status: 401,
            redirectTo: "/login",
          };
        }

        // Check if user has MFA enabled
        const hasMFA = await mfaService.hasMFAEnabled();

        // For API routes, check AAL level
        if (pathname.startsWith("/api/admin")) {
          const aal = await mfaService.getAAL();
          if (aal.currentLevel !== "aal2") {
            return {
              valid: false,
              error: "MFA verification required for admin operations",
              status: 403,
              mfaRequired: true,
            };
          }
        }

        // For admin pages, redirect to MFA setup if not enabled
        if (!hasMFA && pathname.startsWith("/admin")) {
          // Allow access to MFA setup page
          if (pathname.includes("/security/mfa")) {
            return { valid: true };
          }

          return {
            valid: false,
            error: "MFA required for admin access",
            status: 302,
            redirectTo: "/admin/security/mfa",
            mfaRequired: true,
          };
        }

        return { valid: true };
      } catch (error) {
        console.error("MFA verification error:", error);
        return {
          valid: false,
          error: "MFA verification failed",
          status: 500,
        };
      }
    };
  }

  /**
   * Verify MFA for API requests
   */
  static async verifyMFAToken(): Promise<boolean> {
    try {
      const supabase = createClient();
      const mfaService = new MFAService();

      // Check session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        return false;
      }

      // Check MFA status
      const aal = await mfaService.getAAL();
      return aal.currentLevel === "aal2";
    } catch (error) {
      console.error("MFA token verification error:", error);
      return false;
    }
  }

  /**
   * Get MFA status for current user
   */
  static async getMFAStatus() {
    try {
      const supabase = createClient();
      const mfaService = new MFAService();

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        return null;
      }

      const status = await mfaService.getMFAStatus();
      return status;
    } catch (error) {
      console.error("Get MFA status error:", error);
      return null;
    }
  }

  /**
   * Check if path requires MFA
   */
  static requiresMFA(
    pathname: string,
    options: MFAMiddlewareOptions = {}
  ): boolean {
    const finalOptions = { ...this.defaultOptions, ...options };

    // Exclude specified paths
    if (finalOptions.excludePaths?.some((path) => pathname.startsWith(path))) {
      return false;
    }

    // Only admin routes require MFA
    return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  }
}

/**
 * MFA verification middleware function
 */
export async function withMFAVerification(
  request: NextRequest,
  options: MFAMiddlewareOptions = {}
): Promise<{ valid: boolean; response?: NextResponse }> {
  const middleware = MFAMiddleware.createMFAMiddleware(options);
  const result = await middleware(request);

  if (!result.valid) {
    let response: NextResponse;

    if (result.status === 302 && result.redirectTo) {
      response = NextResponse.redirect(new URL(result.redirectTo, request.url));
    } else if (result.status === 401) {
      response = NextResponse.json(
        { error: result.error || "Unauthorized" },
        { status: 401 }
      );
    } else if (result.status === 403) {
      response = NextResponse.json(
        {
          error: result.error || "Forbidden",
          mfaRequired: result.mfaRequired,
        },
        { status: 403 }
      );
    } else {
      response = NextResponse.json(
        { error: result.error || "Internal server error" },
        { status: result.status || 500 }
      );
    }

    return { valid: false, response };
  }

  return { valid: true };
}
