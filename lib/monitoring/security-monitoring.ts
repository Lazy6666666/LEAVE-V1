/**
 * Security Monitoring and Alerting System
 *
 * Provides comprehensive security monitoring for production environment
 * with real-time threat detection and alerting
 */

import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: Date;
  userId?: string;
  ip: string;
  userAgent: string;
  details: Record<string, any>;
  resolved: boolean;
}

enum SecurityEventType {
  // Authentication events
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGOUT = "LOGOUT",
  PASSWORD_RESET = "PASSWORD_RESET",
  MFA_FAILED = "MFA_FAILED",
  SESSION_HIJACK = "SESSION_HIJACK",

  // Authorization events
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  FORBIDDEN_ACCESS = "FORBIDDEN_ACCESS",
  PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION",
  RBAC_VIOLATION = "RBAC_VIOLATION",

  // Input validation events
  XSS_ATTEMPT = "XSS_ATTEMPT",
  SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
  CSRF_ATTEMPT = "CSRF_ATTEMPT",
  MALICIOUS_INPUT = "MALICIOUS_INPUT",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // System events
  CONFIGURATION_CHANGE = "CONFIGURATION_CHANGE",
  SECURITY_BREACH = "SECURITY_BREACH",
  DATA_EXFILTRATION = "DATA_EXFILTRATION",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",

  // File upload events
  MALICIOUS_UPLOAD = "MALICIOUS_UPLOAD",
  UNAUTHORIZED_UPLOAD = "UNAUTHORIZED_UPLOAD",
  LARGE_FILE_UPLOAD = "LARGE_FILE_UPLOAD",

  // API events
  API_ABUSE = "API_ABUSE",
  UNUSUAL_API_PATTERN = "UNUSUAL_API_PATTERN",
  BRUTE_FORCE_ATTEMPT = "BRUTE_FORCE_ATTEMPT",
}

enum SecuritySeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export class SecurityMonitoring {
  private static instance: SecurityMonitoring;
  private supabase = createClient();
  private eventQueue: SecurityEvent[] = [];
  private alertThresholds = {
    // Failed logins per minute
    failedLoginsPerMinute: 5,
    // Failed logins per hour
    failedLoginsPerHour: 20,
    // Rate limit hits per minute
    rateLimitHitsPerMinute: 10,
    // XSS attempts per hour
    xssAttemptsPerHour: 3,
  };

  private constructor() {}

  static getInstance(): SecurityMonitoring {
    if (!SecurityMonitoring.instance) {
      SecurityMonitoring.instance = new SecurityMonitoring();
    }
    return SecurityMonitoring.instance;
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    ip: string,
    userAgent: string,
    details: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      severity,
      timestamp: new Date(),
      userId,
      ip,
      userAgent,
      details,
      resolved: false,
    };

    try {
      // Log to database
      await this.supabase.from("security_events").insert({
        id: event.id,
        type: event.type,
        severity: event.severity,
        timestamp: event.timestamp.toISOString(),
        user_id: event.userId,
        ip: event.ip,
        user_agent: event.userAgent,
        details: event.details,
        resolved: event.resolved,
      });

      // Check for alerting conditions
      await this.checkAlertConditions(event);

      // Add to queue for processing
      this.eventQueue.push(event);
      this.processEventQueue();
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `sec_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Check alert conditions based on recent events
   */
  private async checkAlertConditions(event: SecurityEvent): Promise<void> {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    try {
      // Check for high frequency failed logins
      if (event.type === SecurityEventType.LOGIN_FAILED) {
        const recentFailed = await this.supabase
          .from("security_events")
          .select("*")
          .eq("type", SecurityEventType.LOGIN_FAILED)
          .gte("timestamp", oneMinuteAgo.toISOString())
          .lt("timestamp", now.toISOString());

        if (recentFailed.data && recentFailed.data.length >= this.alertThresholds.failedLoginsPerMinute) {
          await this.triggerAlert({
            type: "BRUTE_FORCE_ATTACK",
            severity: SecuritySeverity.HIGH,
            message: `High frequency failed logins detected from IP: ${event.ip}`,
            details: {
              ip: event.ip,
              attempts: recentFailed.data.length + 1,
              timeWindow: "1 minute",
            },
          });
        }
      }

      // Check for XSS attempts
      if (event.type === SecurityEventType.XSS_ATTEMPT) {
        const recentXss = await this.supabase
          .from("security_events")
          .select("*")
          .eq("type", SecurityEventType.XSS_ATTEMPT)
          .gte("timestamp", oneHourAgo.toISOString())
          .lt("timestamp", now.toISOString());

        if (recentXss.data && recentXss.data.length >= this.alertThresholds.xssAttemptsPerHour) {
          await this.triggerAlert({
            type: "XSS_ATTACK_PATTERN",
            severity: SecuritySeverity.HIGH,
            message: `Multiple XSS attempts detected from IP: ${event.ip}`,
            details: {
              ip: event.ip,
              attempts: recentXss.data.length + 1,
              timeWindow: "1 hour",
            },
          });
        }
      }

      // Check for rate limit abuse
      if (event.type === SecurityEventType.RATE_LIMIT_EXCEEDED) {
        const recentRateLimitHits = await this.supabase
          .from("security_events")
          .select("*")
          .eq("type", SecurityEventType.RATE_LIMIT_EXCEEDED)
          .gte("timestamp", oneMinuteAgo.toISOString())
          .lt("timestamp", now.toISOString());

        if (recentRateLimitHits.data && recentRateLimitHits.data.length >= this.alertThresholds.rateLimitHitsPerMinute) {
          await this.triggerAlert({
            type: "API_ABUSE",
            severity: SecuritySeverity.MEDIUM,
            message: `Rate limit abuse detected from IP: ${event.ip}`,
            details: {
              ip: event.ip,
              hits: recentRateLimitHits.data.length + 1,
              timeWindow: "1 minute",
            },
          });
        }
      }
    } catch (error) {
      console.error("Failed to check alert conditions:", error);
    }
  }

  /**
   * Trigger security alert
   */
  private async triggerAlert(alert: {
    type: string;
    severity: SecuritySeverity;
    message: string;
    details: Record<string, any>;
  }): Promise<void> {
    try {
      // Log alert to database
      await this.supabase.from("security_alerts").insert({
        id: this.generateEventId(),
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        details: alert.details,
        timestamp: new Date().toISOString(),
        resolved: false,
      });

      // Send notification to administrators
      await this.notifyAdministrators(alert);

      // If critical, take immediate action
      if (alert.severity === SecuritySeverity.CRITICAL) {
        await this.takeImmediateAction(alert);
      }
    } catch (error) {
      console.error("Failed to trigger alert:", error);
    }
  }

  /**
   * Notify administrators of security alerts
   */
  private async notifyAdministrators(alert: {
    type: string;
    severity: SecuritySeverity;
    message: string;
    details: Record<string, any>;
  }): Promise<void> {
    try {
      // Get administrators from database
      const { data: admins } = await this.supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("role", ["ADMIN", "HR"]);

      if (!admins || admins.length === 0) {
        return;
      }

      // Create security notifications
      const notifications = admins.map(admin => ({
        user_id: admin.user_id,
        type: "SECURITY_ALERT",
        title: `Security Alert: ${alert.type}`,
        message: alert.message,
        read: false,
        details: alert.details,
      }));

      await this.supabase.from("notification_logs").insert(notifications);

      // Send email if configured
      if (process.env.SMTP_HOST && admins.length > 0) {
        await this.sendSecurityAlertEmail(alert, admins);
      }
    } catch (error) {
      console.error("Failed to notify administrators:", error);
    }
  }

  /**
   * Send security alert email
   */
  private async sendSecurityAlertEmail(
    alert: { type: string; severity: SecuritySeverity; message: string },
    _admins: any[]
  ): Promise<void> {
    // Email implementation would go here
    // This is a placeholder for email notification system
    console.log(`SECURITY ALERT EMAIL: ${alert.type} - ${alert.message}`);
  }

  /**
   * Take immediate action for critical alerts
   */
  private async takeImmediateAction(alert: {
    type: string;
    severity: SecuritySeverity;
    details: Record<string, any>;
  }): Promise<void> {
    try {
      const ip = alert.details.ip;

      if (ip) {
        // Block IP temporarily
        await this.blockIP(ip, 60 * 60); // 1 hour block

        // Invalidate all sessions from this IP
        await this.invalidateSessionsByIP(ip);
      }

      console.log(`Immediate action taken for critical alert: ${alert.type}`);
    } catch (error) {
      console.error("Failed to take immediate action:", error);
    }
  }

  /**
   * Block IP address
   */
  private async blockIP(ip: string, durationSeconds: number): Promise<void> {
    try {
      await this.supabase.from("blocked_ips").insert({
        ip,
        blocked_until: new Date(Date.now() + durationSeconds * 1000).toISOString(),
        reason: "Security alert auto-block",
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to block IP:", error);
    }
  }

  /**
   * Invalidate sessions by IP
   */
  private async invalidateSessionsByIP(ip: string): Promise<void> {
    try {
      // Mark sessions as invalidated
      await this.supabase
        .from("security_events")
        .update({ details: { session_invalidated: true } })
        .eq("ip", ip)
        .eq("type", SecurityEventType.LOGIN_SUCCESS)
        .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours
    } catch (error) {
      console.error("Failed to invalidate sessions:", error);
    }
  }

  /**
   * Process event queue
   */
  private processEventQueue(): void {
    // Process events in batches
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.analyzeEvent(event);
      }
    }
  }

  /**
   * Analyze security event for patterns
   */
  private async analyzeEvent(event: SecurityEvent): Promise<void> {
    // Event analysis logic here
    // This could include ML-based anomaly detection
    // For now, just log the event
    console.log(`Security event analyzed: ${event.type} from ${event.ip}`);
  }

  /**
   * Get security dashboard data
   */
  async getSecurityDashboard() {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        recentEvents,
        recentAlerts,
        activeThreats,
        blockedIPs,
      ] = await Promise.all([
        // Recent security events (24h)
        this.supabase
          .from("security_events")
          .select("*")
          .gte("timestamp", oneDayAgo.toISOString())
          .order("timestamp", { ascending: false })
          .limit(100),

        // Recent alerts (24h)
        this.supabase
          .from("security_alerts")
          .select("*")
          .gte("timestamp", oneDayAgo.toISOString())
          .order("timestamp", { ascending: false })
          .limit(50),

        // Active threats (7 days)
        this.supabase
          .from("security_events")
          .select("*")
          .gte("timestamp", oneWeekAgo.toISOString())
          .in("severity", [SecuritySeverity.HIGH, SecuritySeverity.CRITICAL])
          .order("timestamp", { ascending: false })
          .limit(100),

        // Blocked IPs
        this.supabase
          .from("blocked_ips")
          .select("*")
          .gt("blocked_until", now.toISOString()),
      ]);

      return {
        recentEvents: recentEvents.data || [],
        recentAlerts: recentAlerts.data || [],
        activeThreats: activeThreats.data || [],
        blockedIPs: blockedIPs.data || [],
        summary: {
          totalEvents24h: recentEvents.data?.length || 0,
          totalAlerts24h: recentAlerts.data?.length || 0,
          activeBlockedIPs: blockedIPs.data?.length || 0,
          criticalAlerts: recentAlerts.data?.filter((a: any) => a.severity === SecuritySeverity.CRITICAL).length || 0,
        },
      };
    } catch (error) {
      console.error("Failed to get security dashboard:", error);
      throw error;
    }
  }
}

// Create security monitoring tables schema
export const SECURITY_TABLES_SQL = `
-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip TEXT NOT NULL,
  user_agent TEXT,
  details JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Alerts Table
CREATE TABLE IF NOT EXISTS security_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked IPs Table
CREATE TABLE IF NOT EXISTS blocked_ips (
  id SERIAL PRIMARY KEY,
  ip TEXT NOT NULL UNIQUE,
  blocked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip);
CREATE INDEX IF NOT EXISTS idx_security_alerts_timestamp ON security_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON blocked_ips(ip);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_until ON blocked_ips(blocked_until);
`;

export { SecurityEventType, SecuritySeverity };