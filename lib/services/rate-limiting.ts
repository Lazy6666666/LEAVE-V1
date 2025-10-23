import { createClient } from "@/lib/supabase/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  windowStart: number;
}

export class RateLimitingService {
  private static instance: RateLimitingService;
  private store = new Map<string, RateLimitEntry>();
  private supabase = createClient();

  private constructor() {}

  static getInstance(): RateLimitingService {
    if (!RateLimitingService.instance) {
      RateLimitingService.instance = new RateLimitingService();
    }
    return RateLimitingService.instance;
  }

  /**
   * Check rate limit for a given identifier
   */
  async checkRateLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      // New window
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs,
        windowStart: now,
      };
      this.store.set(identifier, newEntry);

      // Log rate limit check
      await this.logRateLimitEvent(identifier, "new_window", config, newEntry);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // Check if within window
    if (now - entry.windowStart < config.windowMs) {
      if (entry.count >= config.maxRequests) {
        // Rate limit exceeded
        await this.logRateLimitEvent(identifier, "exceeded", config, entry);

        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime,
        };
      }

      // Increment counter
      entry.count++;

      await this.logRateLimitEvent(identifier, "increment", config, entry);

      return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime,
      };
    }

    // Window expired, create new
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
      windowStart: now,
    };
    this.store.set(identifier, newEntry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  /**
   * Get rate limit status without incrementing
   */
  getRateLimitStatus(
    identifier: string,
    config: RateLimitConfig
  ): { remaining: number; resetTime: number; resetIn: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      return {
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        resetIn: config.windowMs,
      };
    }

    return {
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      resetIn: Math.max(0, entry.resetTime - now),
    };
  }

  /**
   * Create rate limit middleware for API routes
   */
  createRateLimitMiddleware(config: RateLimitConfig) {
    return async (request: Request) => {
      // Get identifier from IP or user ID
      const identifier = await this.getIdentifier(request);

      if (!identifier) {
        return {
          allowed: false,
          error: "Unable to identify request",
          status: 400,
        };
      }

      const result = await this.checkRateLimit(identifier, config);

      if (!result.allowed) {
        return {
          allowed: false,
          error: config.message || "Too many requests",
          status: 429,
          headers: {
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
            "Retry-After": Math.ceil(
              (result.resetTime - Date.now()) / 1000
            ).toString(),
          },
        };
      }

      return {
        allowed: true,
        headers: {
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
        },
      };
    };
  }

  /**
   * Get identifier for rate limiting
   */
  private async getIdentifier(request: Request): Promise<string | null> {
    // Try to get user ID from JWT token
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const { JWTValidationService } = await import(
          "@/lib/auth/jwt-validation"
        );
        const jwtService = JWTValidationService.getInstance();
        const payload = await jwtService.validateTokenFromHeader(authHeader);
        if (payload) {
          return `user:${payload.sub}`;
        }
      } catch {
        // Continue to IP-based identification
      }
    }

    // Fall back to IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0] || realIp || null;

    if (ip) {
      return `ip:${ip}`;
    }

    return null;
  }

  /**
   * Log rate limit events to database
   */
  private async logRateLimitEvent(
    identifier: string,
    event: string,
    config: RateLimitConfig,
    entry: RateLimitEntry
  ) {
    try {
      await this.supabase.from("rate_limit_logs").insert({
        identifier,
        event,
        window_size_ms: config.windowMs,
        max_requests: config.maxRequests,
        current_count: entry.count,
        reset_time: new Date(entry.resetTime).toISOString(),
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      // Don't fail if logging fails
      console.error("Failed to log rate limit event:", error);
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      RateLimitingService.getInstance().cleanup();
    },
    5 * 60 * 1000
  );
}

// Predefined configurations
export const RATE_LIMITS = {
  // API endpoints: 100 requests per minute
  API: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    message: "Too many API requests. Please try again later.",
  },

  // Authentication: 5 requests per minute
  AUTH: {
    windowMs: 60 * 1000,
    maxRequests: 5,
    message: "Too many authentication attempts. Please try again later.",
  },

  // File upload: 10 requests per minute
  UPLOAD: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: "Too many upload attempts. Please try again later.",
  },

  // Leave submission: 10 requests per minute
  LEAVE_SUBMISSION: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: "Too many leave submission attempts. Please try again later.",
  },

  // Sensitive operations: 20 requests per hour
  SENSITIVE: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    message: "Too many sensitive operations. Please try again later.",
  },
};
