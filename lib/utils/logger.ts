// Enhanced Logger with Query Performance Monitoring
// Provides logging and slow query detection for database operations

export interface LogEntry {
  timestamp: Date;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR";
  message: string;
  metadata?: Record<string, any>;
  query?: string;
  duration?: number;
  userId?: string;
  requestId?: string;
}

export interface QueryMetrics {
  query: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  errorCount: number;
  lastExecuted: Date;
}

export interface SlowQueryAlert {
  query: string;
  duration: number;
  threshold: number;
  timestamp: Date;
  userId?: string;
  parameters?: any[];
}

class Logger {
  private logs: LogEntry[] = [];
  private queryMetrics: Map<string, QueryMetrics> = new Map();
  private slowQueryThreshold: number = 100; // milliseconds
  private maxLogEntries: number = 1000;
  private maxQueryMetrics: number = 100;

  constructor() {
    // Set up log rotation
    setInterval(
      () => {
        this.rotateLogs();
        this.cleanupOldMetrics();
      },
      60 * 60 * 1000
    ); // Every hour
  }

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log("DEBUG", message, metadata);
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log("INFO", message, metadata);
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log("WARN", message, metadata);
  }

  /**
   * Log an error message
   */
  error(message: string, metadata?: Record<string, any>): void {
    this.log("ERROR", message, metadata);
  }

  /**
   * Log a database query with performance tracking
   */
  logQuery(
    query: string,
    duration: number,
    userId?: string,
    requestId?: string,
    parameters?: any[],
    error?: Error
  ): void {
    const level = error
      ? "ERROR"
      : duration > this.slowQueryThreshold
        ? "WARN"
        : "DEBUG";
    const message = error
      ? `Query failed: ${query.substring(0, 100)}...`
      : `Query executed: ${query.substring(0, 100)}...`;

    this.log(
      level,
      message,
      {
        query: query.substring(0, 500),
        duration,
        parameters: parameters?.slice(0, 5), // Limit logged parameters
        error: error?.message,
      },
      query,
      duration,
      userId,
      requestId
    );

    // Update query metrics
    this.updateQueryMetrics(query, duration, error);

    // Check for slow queries
    if (duration > this.slowQueryThreshold && !error) {
      this.handleSlowQuery(query, duration, userId, parameters);
    }
  }

  /**
   * Log a function execution with timing
   */
  logFunction<T>(
    functionName: string,
    fn: () => Promise<T>,
    userId?: string,
    requestId?: string
  ): Promise<T> {
    const startTime = performance.now();
    this.debug(`Starting function: ${functionName}`, { userId, requestId });

    return fn()
      .then((result) => {
        const duration = performance.now() - startTime;
        this.debug(`Completed function: ${functionName}`, {
          duration: Math.round(duration),
          userId,
          requestId,
        });
        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;
        this.error(`Function failed: ${functionName}`, {
          duration: Math.round(duration),
          error: error.message,
          userId,
          requestId,
        });
        throw error;
      });
  }

  /**
   * Get recent logs
   */
  getLogs(level?: string, limit: number = 100): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = this.logs.filter((log) => log.level === level);
    }

    return filteredLogs.slice(-limit).reverse(); // Most recent first
  }

  /**
   * Get query metrics
   */
  getQueryMetrics(): QueryMetrics[] {
    return Array.from(this.queryMetrics.values())
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, 50); // Top 50 queries by total time
  }

  /**
   * Get slow queries
   */
  getSlowQueries(threshold?: number): SlowQueryAlert[] {
    const slowThreshold = threshold || this.slowQueryThreshold;
    const slowQueries: SlowQueryAlert[] = [];

    for (const [query, metrics] of this.queryMetrics.entries()) {
      if (metrics.averageDuration > slowThreshold) {
        slowQueries.push({
          query,
          duration: metrics.averageDuration,
          threshold: slowThreshold,
          timestamp: metrics.lastExecuted,
        });
      }
    }

    return slowQueries.sort((a, b) => b.duration - a.duration);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalQueries: number;
    averageQueryTime: number;
    slowQueriesCount: number;
    errorRate: number;
    topSlowQueries: SlowQueryAlert[];
  } {
    const metrics = Array.from(this.queryMetrics.values());
    const totalQueries = metrics.reduce((sum, m) => sum + m.count, 0);
    const totalDuration = metrics.reduce((sum, m) => sum + m.totalDuration, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0);
    const slowQueries = this.getSlowQueries();

    return {
      totalQueries,
      averageQueryTime: totalQueries > 0 ? totalDuration / totalQueries : 0,
      slowQueriesCount: slowQueries.length,
      errorRate: totalQueries > 0 ? (totalErrors / totalQueries) * 100 : 0,
      topSlowQueries: slowQueries.slice(0, 10),
    };
  }

  /**
   * Export logs for external monitoring
   */
  exportLogs(format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      const headers = [
        "timestamp",
        "level",
        "message",
        "query",
        "duration",
        "userId",
      ];
      const rows = this.logs.map((log) => [
        log.timestamp.toISOString(),
        log.level,
        log.message.replace(/"/g, '""'),
        (log.query || "").replace(/"/g, '""'),
        log.duration || "",
        log.userId || "",
      ]);

      return [headers, ...rows].map((row) => row.join(",")).join("\n");
    }

    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.queryMetrics.clear();
  }

  /**
   * Core logging method
   */
  private log(
    level: LogEntry["level"],
    message: string,
    metadata?: Record<string, any>,
    query?: string,
    duration?: number,
    userId?: string,
    requestId?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      metadata,
      query,
      duration,
      userId,
      requestId,
    };

    this.logs.push(entry);

    // Output to console in development
    if (process.env.NODE_ENV === "development") {
      const colorMap = {
        DEBUG: "\x1b[36m", // cyan
        INFO: "\x1b[32m", // green
        WARN: "\x1b[33m", // yellow
        ERROR: "\x1b[31m", // red
      };
      const reset = "\x1b[0m";

      console.log(
        `${colorMap[level]}[${level}]${reset} ${entry.timestamp.toISOString()} - ${message}`,
        metadata || ""
      );
    }

    // In production, you might want to send logs to external service
    if (process.env.NODE_ENV === "production" && level === "ERROR") {
      // Send to error monitoring service (e.g., Sentry, LogRocket)
      console.error("Production error:", { message, metadata });
    }
  }

  /**
   * Update query metrics
   */
  private updateQueryMetrics(
    query: string,
    duration: number,
    error?: Error
  ): void {
    const queryHash = this.hashQuery(query);
    const existing = this.queryMetrics.get(queryHash);

    if (existing) {
      existing.count++;
      existing.totalDuration += duration;
      existing.averageDuration = existing.totalDuration / existing.count;
      existing.maxDuration = Math.max(existing.maxDuration, duration);
      existing.minDuration = Math.min(existing.minDuration, duration);
      if (error) existing.errorCount++;
      existing.lastExecuted = new Date();
    } else {
      this.queryMetrics.set(queryHash, {
        query,
        count: 1,
        totalDuration: duration,
        averageDuration: duration,
        maxDuration: duration,
        minDuration: duration,
        errorCount: error ? 1 : 0,
        lastExecuted: new Date(),
      });
    }
  }

  /**
   * Handle slow query detection
   */
  private handleSlowQuery(
    query: string,
    duration: number,
    userId?: string,
    parameters?: any[]
  ): void {
    const alert: SlowQueryAlert = {
      query: query.substring(0, 200),
      duration,
      threshold: this.slowQueryThreshold,
      timestamp: new Date(),
      userId,
      parameters,
    };

    this.warn(
      `Slow query detected (${duration}ms > ${this.slowQueryThreshold}ms)`,
      {
        query: query.substring(0, 200),
        duration,
        userId,
      }
    );

    // In production, you might want to send alerts to monitoring systems
    if (process.env.NODE_ENV === "production") {
      console.warn("Slow query alert:", alert);
    }
  }

  /**
   * Hash query for metrics tracking
   */
  private hashQuery(query: string): string {
    // Simple hash - in production you might want a more sophisticated approach
    return query
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/\d+/g, "?") // Replace numbers with placeholders
      .replace(/'[^']*'/g, "?") // Replace string literals
      .trim();
  }

  /**
   * Rotate old logs
   */
  private rotateLogs(): void {
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }
  }

  /**
   * Clean up old query metrics
   */
  private cleanupOldMetrics(): void {
    if (this.queryMetrics.size > this.maxQueryMetrics) {
      // Keep only the most frequently executed or slowest queries
      const sorted = Array.from(this.queryMetrics.entries()).sort((a, b) => {
        const scoreA = a[1].count * a[1].averageDuration;
        const scoreB = b[1].count * b[1].averageDuration;
        return scoreB - scoreA;
      });

      this.queryMetrics = new Map(sorted.slice(0, this.maxQueryMetrics));
    }
  }
}

// Singleton instance
export const logger = new Logger();

// Helper function to wrap database operations with logging
export function withQueryLogging<T>(
  queryName: string,
  operation: () => Promise<T>,
  userId?: string
): Promise<T> {
  const startTime = performance.now();

  return operation()
    .then((result) => {
      const duration = performance.now() - startTime;
      logger.logQuery(queryName, duration, userId);
      return result;
    })
    .catch((error) => {
      const duration = performance.now() - startTime;
      logger.logQuery(queryName, duration, userId, undefined, undefined, error);
      throw error;
    });
}

// Prisma query logging middleware
export function createPrismaLoggingMiddleware(userId?: string) {
  return {
    async beforeExecute(event: any) {
      event.start = performance.now();
    },

    async afterExecute(event: any) {
      const duration = performance.now() - event.start;
      logger.logQuery(event.query, duration, userId, undefined, event.params);
    },

    async onError(event: any) {
      const duration = performance.now() - event.start;
      logger.logQuery(
        event.query,
        duration,
        userId,
        undefined,
        event.params,
        event.error
      );
    },
  };
}
