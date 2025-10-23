import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface IPWhitelistConfig {
  enabled: boolean;
  allowedIPs: string[];
  allowedRanges: string[];
  bypassRoles: string[];
  excludePaths: string[];
  enableAdminNotifications: boolean;
  enableAuditLogging: boolean;
}

export interface IPInfo {
  ip: string;
  userAgent?: string;
  timestamp: string;
  path: string;
  method: string;
  userId?: string;
}

export class IPWhitelistService {
  private static defaultConfig: IPWhitelistConfig = {
    enabled: process.env.NODE_ENV === "production",
    allowedIPs: [],
    allowedRanges: [],
    bypassRoles: ["ADMIN"],
    excludePaths: ["/api/auth/", "/health", "/metrics", "/api/webhooks/"],
    enableAdminNotifications: true,
    enableAuditLogging: true,
  };

  /**
   * Get client IP address from request
   */
  private static getClientIP(request: NextRequest): string {
    // Check various headers for the real IP
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const cfConnectingIP = request.headers.get("cf-connecting-ip"); // Cloudflare
    const xClientIP = request.headers.get("x-client-ip");
    const xForwarded = request.headers.get("x-forwarded");
    const forwardedFor = request.headers.get("forwarded-for");
    const forwardedHost = request.headers.get("forwarded");

    let ip = realIP || cfConnectingIP || xClientIP || request.ip || "unknown";

    // Handle x-forwarded-for header (can contain multiple IPs)
    if (forwarded) {
      const forwardedIps = forwarded.split(",").map((ip) => ip.trim());
      ip = forwardedIps[0]; // Take the first (original) IP
    }

    if (xForwarded || forwardedFor || forwardedHost) {
      const xForwardedIps = (xForwarded || forwardedFor || forwardedHost || "")
        .split(",")
        .map((ip) => ip.trim());
      ip = xForwardedIps[0];
    }

    // Handle Cloudflare specific headers
    if (cfConnectingIP) {
      ip = cfConnectingIP;
    }

    // Validate IP format
    if (!this.isValidIP(ip)) {
      return "unknown";
    }

    return ip;
  }

  /**
   * Validate IP address format
   */
  private static isValidIP(ip: string): boolean {
    // IPv4 regex
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // IPv6 regex (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === "unknown";
  }

  /**
   * Check if IP is in allowed ranges using CIDR notation
   */
  private static isIPInRanges(ip: string, ranges: string[]): boolean {
    for (const range of ranges) {
      if (this.isIPInRange(ip, range)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if IP is in a specific CIDR range
   */
  private static isIPInRange(ip: string, range: string): boolean {
    try {
      const [network, prefixLength] = range.split("/");
      const networkParts = network.split(".").map(Number);
      const ipParts = ip.split(".").map(Number);

      if (networkParts.length !== 4 || ipParts.length !== 4) {
        return false;
      }

      const mask = parseInt(prefixLength, 10);
      const maskBytes = Math.floor(mask / 8);
      const maskBits = mask % 8;

      // Check full bytes
      for (let i = 0; i < maskBytes; i++) {
        if (networkParts[i] !== ipParts[i]) {
          return false;
        }
      }

      // Check remaining bits
      if (maskBits > 0 && maskBytes < 4) {
        const networkByte = networkParts[maskBytes];
        const ipByte = ipParts[maskBytes];
        const bitMask = 256 - (1 << (8 - maskBits));

        if ((networkByte & bitMask) !== (ipByte & bitMask)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error checking IP range:", error);
      return false;
    }
  }

  /**
   * Load IP whitelist configuration from environment or database
   */
  private static async loadWhitelistConfig(): Promise<IPWhitelistConfig> {
    const config = { ...this.defaultConfig };

    // Load from environment variables
    if (process.env.ALLOWED_IPS) {
      config.allowedIPs = process.env.ALLOWED_IPS.split(",").map((ip) =>
        ip.trim()
      );
    }

    if (process.env.ALLOWED_IP_RANGES) {
      config.allowedRanges = process.env.ALLOWED_IP_RANGES.split(",").map(
        (range) => range.trim()
      );
    }

    // Load from database (if configured)
    try {
      const supabase = createClient();
      const { data: settings } = await supabase
        .from("security_settings")
        .select("ip_whitelist_enabled, allowed_ips, allowed_ranges")
        .eq("key", "ip_whitelist")
        .single();

      if (settings) {
        config.enabled = settings.ip_whitelist_enabled;
        config.allowedIPs = settings.allowed_ips || [];
        config.allowedRanges = settings.allowed_ranges || [];
      }
    } catch (error) {
      console.error("Error loading IP whitelist from database:", error);
    }

    return config;
  }

  /**
   * Check if user role bypasses IP whitelist
   */
  private static async shouldBypassForRole(
    request: NextRequest,
    bypassRoles: string[]
  ): Promise<boolean> {
    const userRole = request.headers.get("x-user-role");

    if (!userRole) {
      return false;
    }

    return bypassRoles.includes(userRole);
  }

  /**
   * Log IP access attempt
   */
  private static async logAccessAttempt(
    ipInfo: IPInfo,
    config: IPWhitelistConfig
  ): Promise<void> {
    if (!config.enableAuditLogging) {
      return;
    }

    try {
      const supabase = createClient();

      await supabase.from("ip_access_logs").insert({
        ip_address: ipInfo.ip,
        user_agent: ipInfo.userAgent,
        path: ipInfo.path,
        method: ipInfo.method,
        user_id: ipInfo.userId,
        access_time: ipInfo.timestamp,
        success: true,
      });
    } catch (error) {
      console.error("Error logging IP access:", error);
    }
  }

  /**
   * Log IP blocked attempt
   */
  private static async logBlockedAttempt(
    ipInfo: IPInfo,
    config: IPWhitelistConfig
  ): Promise<void> {
    if (!config.enableAuditLogging) {
      return;
    }

    try {
      const supabase = createClient();

      await supabase.from("ip_access_logs").insert({
        ip_address: ipInfo.ip,
        user_agent: ipInfo.userAgent,
        path: ipInfo.path,
        method: ipInfo.method,
        user_id: ipInfo.userId,
        access_time: ipInfo.timestamp,
        success: false,
        blocked_reason: "IP_NOT_WHITELISTED",
      });

      // Send admin notification if enabled
      if (config.enableAdminNotifications) {
        await this.sendAdminNotification(ipInfo);
      }
    } catch (error) {
      console.error("Error logging blocked IP access:", error);
    }
  }

  /**
   * Send admin notification for blocked access
   */
  private static async sendAdminNotification(ipInfo: IPInfo): Promise<void> {
    try {
      const supabase = createClient();

      // Get admin users
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "ADMIN");

      if (admins) {
        for (const admin of admins) {
          await supabase.from("notification_logs").insert({
            user_id: admin.id,
            type: "SECURITY_ALERT",
            title: "IP Access Blocked",
            message: `Access blocked for IP ${ipInfo.ip} attempting to access ${ipInfo.path}`,
            link: "/admin/security/ip-access",
            read: false,
          });
        }
      }
    } catch (error) {
      console.error("Error sending admin notification:", error);
    }
  }

  /**
   * Validate IP address against whitelist
   */
  static async validateIP(
    request: NextRequest,
    customConfig?: IPWhitelistConfig
  ): Promise<{
    allowed: boolean;
    ip: string;
    reason?: string;
  }> {
    const config = customConfig || (await this.loadWhitelistConfig());

    // Skip if IP whitelisting is disabled
    if (!config.enabled) {
      const ip = this.getClientIP(request);
      return { allowed: true, ip };
    }

    const ip = this.getClientIP(request);
    const ipInfo: IPInfo = {
      ip,
      userAgent: request.headers.get("user-agent") || undefined,
      timestamp: new Date().toISOString(),
      path: request.nextUrl.pathname,
      method: request.method,
      userId: request.headers.get("x-user-id") || undefined,
    };

    // Check if path is excluded
    if (
      config.excludePaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
      )
    ) {
      await this.logAccessAttempt(ipInfo, config);
      return { allowed: true, ip };
    }

    // Check if user role bypasses whitelist
    const shouldBypass = await this.shouldBypassForRole(
      request,
      config.bypassRoles
    );
    if (shouldBypass) {
      await this.logAccessAttempt(ipInfo, config);
      return { allowed: true, ip };
    }

    // Check if IP is in allowed IPs list
    if (config.allowedIPs.includes(ip)) {
      await this.logAccessAttempt(ipInfo, config);
      return { allowed: true, ip };
    }

    // Check if IP is in allowed ranges
    if (this.isIPInRanges(ip, config.allowedRanges)) {
      await this.logAccessAttempt(ipInfo, config);
      return { allowed: true, ip };
    }

    // IP is not allowed
    await this.logBlockedAttempt(ipInfo, config);

    return {
      allowed: false,
      ip,
      reason: "IP address not in whitelist",
    };
  }

  /**
   * Create IP whitelist middleware
   */
  static createIPWhitelistMiddleware(customConfig?: IPWhitelistConfig) {
    return async (
      request: NextRequest
    ): Promise<{ allowed: boolean; response?: NextResponse }> => {
      const validation = await this.validateIP(request, customConfig);

      if (!validation.allowed) {
        const response = NextResponse.json(
          {
            error: "Access denied",
            reason: validation.reason,
            ip: validation.ip,
          },
          { status: 403 }
        );

        return { allowed: false, response };
      }

      return { allowed: true };
    };
  }

  /**
   * Get IP access logs
   */
  static async getAccessLogs(
    limit = 100,
    offset = 0,
    filters?: {
      ip?: string;
      success?: boolean;
      startDate?: string;
      endDate?: string;
    }
  ) {
    try {
      const supabase = createClient();

      let query = supabase
        .from("ip_access_logs")
        .select("*", { count: "exact" })
        .order("access_time", { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters) {
        if (filters.ip) {
          query = query.eq("ip_address", filters.ip);
        }
        if (filters.success !== undefined) {
          query = query.eq("success", filters.success);
        }
        if (filters.startDate) {
          query = query.gte("access_time", filters.startDate);
        }
        if (filters.endDate) {
          query = query.lte("access_time", filters.endDate);
        }
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        logs: data || [],
        total: count || 0,
        limit,
        offset,
      };
    } catch (error) {
      console.error("Error fetching IP access logs:", error);
      return {
        logs: [],
        total: 0,
        limit,
        offset,
      };
    }
  }

  /**
   * Update IP whitelist configuration
   */
  static async updateWhitelistConfig(
    config: Partial<IPWhitelistConfig>
  ): Promise<boolean> {
    try {
      const supabase = createClient();

      await supabase.from("security_settings").upsert({
        key: "ip_whitelist",
        ip_whitelist_enabled: config.enabled,
        allowed_ips: config.allowedIPs,
        allowed_ranges: config.allowedRanges,
        updated_at: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error("Error updating IP whitelist config:", error);
      return false;
    }
  }
}

/**
 * IP whitelist middleware function
 */
export async function withIPWhitelist(
  request: NextRequest,
  customConfig?: IPWhitelistConfig
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const middleware =
    IPWhitelistService.createIPWhitelistMiddleware(customConfig);
  return await middleware(request);
}
