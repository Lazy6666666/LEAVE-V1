import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SecurityHeadersService } from "@/lib/middleware/security-headers";
import { RateLimitingService, RATE_LIMITS } from "@/lib/services/rate-limiting";
import { withMFAVerification } from "@/lib/middleware/mfa-verification";
import { withCSRFProtection } from "@/lib/middleware/csrf-protection";
import { withIPWhitelist } from "@/lib/middleware/ip-whitelist";

export async function middleware(req: NextRequest) {
  // Apply rate limiting first
  const rateLimitService = RateLimitingService.getInstance();

  // Different rate limits for different routes
  let rateLimitConfig = RATE_LIMITS.API;
  if (req.nextUrl.pathname.startsWith("/api/auth/")) {
    rateLimitConfig = RATE_LIMITS.AUTH;
  } else if (
    req.nextUrl.pathname.startsWith("/api/leaves") &&
    req.method === "POST"
  ) {
    rateLimitConfig = RATE_LIMITS.LEAVE_SUBMISSION;
  } else if (req.nextUrl.pathname.startsWith("/api/documents")) {
    rateLimitConfig = RATE_LIMITS.UPLOAD;
  } else if (req.nextUrl.pathname.startsWith("/api/admin/")) {
    rateLimitConfig = RATE_LIMITS.SENSITIVE;
  }

  const rateLimitResult =
    await rateLimitService.createRateLimitMiddleware(rateLimitConfig)(req);

  if (!rateLimitResult.allowed) {
    const response = new NextResponse(
      JSON.stringify({ error: rateLimitResult.error }),
      { status: rateLimitResult.status }
    );

    // Add rate limit headers
    Object.entries(rateLimitResult.headers || {}).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    response.headers.set("Content-Type", "application/json");
    return response;
  }

  // Apply IP whitelisting for admin routes
  const ipWhitelistResult = await withIPWhitelist(req);
  if (!ipWhitelistResult.allowed && ipWhitelistResult.response) {
    return ipWhitelistResult.response;
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define protected routes
  const protectedRoutes = ["/dashboard"];
  const authRoutes = ["/login", "/register", "/reset-password"];

  const { pathname } = req.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users trying to access auth routes
  if (isAuthRoute && session) {
    const url = new URL("/dashboard", req.url);
    return NextResponse.redirect(url);
  }

  // For protected routes, add user info to headers for server-side usage
  if (session && isProtectedRoute) {
    // Request user profile to get role information
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, department")
      .eq("id", session.user.id)
      .single();

    // Add role information to headers for RBAC
    res.headers.set("x-user-role", profile?.role || "EMPLOYEE");
    res.headers.set("x-user-department", profile?.department || "");
    res.headers.set("x-user-id", session.user.id);
  }

  // Apply MFA verification for admin routes
  if (session && isProtectedRoute) {
    const mfaResult = await withMFAVerification(req);
    if (!mfaResult.valid && mfaResult.response) {
      return mfaResult.response;
    }
  }

  // Apply CSRF protection for state-changing requests
  const csrfResult = await withCSRFProtection(req);
  if (!csrfResult.valid && csrfResult.response) {
    return csrfResult.response;
  }

  // Apply security headers to all responses
  return SecurityHeadersService.applySecurityHeaders(res);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
