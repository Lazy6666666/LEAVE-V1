# Database Performance Optimization Guide

## Overview

This document outlines the comprehensive database performance optimizations implemented in the Leave Management System to ensure high performance, scalability, and efficient resource utilization.

## Performance Optimizations Implemented

### 1. Database Indexing (T201-T204)

#### Composite Indexes

- **`idx_leaves_user_status_created_at`**: Optimizes user leave listings with sorting
- **`idx_leaves_user_status`**: Fast lookup for employee leave queries
- **`idx_leaves_dates`**: Optimizes date range queries for calendar views

#### Partial Indexes

- **`idx_leaves_status_pending`**: Quick access to pending requests for managers
- **`idx_leaves_status_approved`**: Quick access to approved requests for calendar
- **`idx_notifications_user_unread`**: Optimizes unread notification queries

#### Supporting Indexes

- **`idx_leaves_leave_type`**: Optimizes leave type filtering
- **`idx_leaves_approved_by`**: Optimizes manager approval queries
- **`idx_profiles_department`**: Optimizes department-based filtering
- **`idx_audit_user_date`**: Optimizes audit trail queries

### 2. Connection Pooling (T205)

#### Enhanced Prisma Configuration

```typescript
// lib/prisma.ts
export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
}).$extends(withAccelerate());

// Read replica support for dashboard queries
export const readOnlyPrisma = readReplicaUrl
  ? new PrismaClient({
      /* read replica config */
    })
  : prisma;
```

#### Connection Pool Parameters

- **connection_limit**: Maximum number of connections (configured via DATABASE_URL)
- **pool_timeout**: Maximum time to wait for a connection
- **connect_timeout**: Connection establishment timeout
- **idle_timeout**: Idle connection timeout

### 3. Query Result Caching (T206)

#### Calendar Event Caching

```typescript
// lib/services/calendar.ts
const calendarEventCache = new Map<
  string,
  { data: CalendarEvent[]; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCalendarEvents(
  filters: CalendarFilters
): Promise<CalendarEvent[]> {
  const cacheKey = generateCacheKey(filters);

  // Check cache first
  const cached = calendarEventCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Execute query and cache results
  const events = await executeQuery(filters);
  calendarEventCache.set(cacheKey, { data: events, timestamp: Date.now() });

  return events;
}
```

### 4. N+1 Query Prevention (T211)

#### Optimized Includes with Select

```typescript
// Before: Potential N+1 queries
const leaves = await prisma.leave.findMany({
  include: {
    user: { include: { profile: true } },
    leave_type: true,
  },
});

// After: Optimized with selective fields
const leaves = await prisma.leave.findMany({
  include: {
    user: {
      include: {
        profile: {
          select: {
            full_name: true,
            avatar_url: true,
            department: true,
          },
        },
      },
    },
    leave_type: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});
```

### 5. Database Monitoring (T209)

#### Performance Metrics Tracking

```typescript
// lib/services/database-monitoring.ts
export class DatabaseMonitoringService {
  async getPerformanceMetrics(): Promise<DatabaseMetrics> {
    const [cacheHitRate, slowQueries, indexUsage, bloatMetrics] =
      await Promise.all([
        this.getCacheHitRates(),
        this.getSlowQueries(),
        this.getIndexUsage(),
        this.getBloatMetrics(),
      ]);

    return {
      cacheHitRate: cacheHitRate?.overall_cache_hit_rate || 0,
      slowQueries: slowQueries || [],
      indexUsage: indexUsage || [],
      bloatMetrics: bloatMetrics || [],
    };
  }
}
```

#### Performance Targets

- **Cache Hit Rate**: >99%
- **Query Response Time**: <100ms average
- **Table Bloat**: <20%
- **Unused Indexes**: Zero tolerance

### 6. Database Maintenance (T207)

#### Automated Maintenance Functions

```typescript
// lib/services/database-maintenance.ts
export class DatabaseMaintenanceService {
  async runComprehensiveMaintenance(): Promise<MaintenanceResult[]> {
    const highTrafficTables = ["leaves", "notification_logs", "audit_logs"];
    const results: MaintenanceResult[] = [];

    for (const table of highTrafficTables) {
      // Run ANALYZE (lightweight operation)
      await this.runAnalyze(table);

      // Run VACUUM (heavy operation)
      await this.runVacuum(table);
    }

    return results;
  }
}
```

#### Maintenance Schedule

- **ANALYZE**: Daily during off-peak hours
- **VACUUM**: Weekly on high-traffic tables
- **REINDEX**: Monthly or as needed based on bloat metrics

### 7. Query Logging and Slow Query Detection (T212)

#### Comprehensive Logger

```typescript
// lib/utils/logger.ts
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
```

#### Slow Query Alerts

- **Threshold**: 100ms (configurable)
- **Alerting**: Console warnings in development
- **Production**: Integration with external monitoring services

### 8. Performance Testing (T210)

#### Load Testing Framework

```typescript
// tests/performance/database-load-test.ts
export class DatabaseLoadTester {
  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    // Simulate concurrent users
    // Measure response times
    // Track error rates
    // Generate performance report
  }

  async testLeaveQueries(): Promise<QueryPerformance[]> {
    // Test common query patterns
    // Measure performance under load
    // Identify optimization opportunities
  }
}
```

## Performance Monitoring Dashboard

### Key Metrics

1. **Query Performance**
   - Average response time
   - P95/P99 response times
   - Query frequency
   - Error rates

2. **Database Health**
   - Cache hit rates
   - Index usage statistics
   - Table bloat metrics
   - Connection pool utilization

3. **System Performance**
   - Requests per second
   - Concurrent user capacity
   - Memory usage
   - CPU utilization

## Configuration

### Environment Variables

```bash
# Database Connection Pooling
DATABASE_URL="postgresql://user:pass@host:port/db?connection_limit=20&pool_timeout=20"
DATABASE_READ_REPLICA_URL="postgresql://user:pass@replica-host:port/db"

# Performance Monitoring
ENABLE_QUERY_LOGGING=true
SLOW_QUERY_THRESHOLD=100

# Caching
ENABLE_CALENDAR_CACHE=true
CALENDAR_CACHE_TTL=300000
```

### Database Configuration

```sql
-- PostgreSQL performance settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Enable monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
ALTER SYSTEM SET pg_stat_statements.track = 'all';
```

## Best Practices

### Query Optimization

1. **Use appropriate indexes** for frequent query patterns
2. **Select only needed fields** to reduce data transfer
3. **Use LIMIT and OFFSET** for pagination
4. **Avoid OR conditions** in WHERE clauses when possible
5. **Use EXISTS instead of IN** for subqueries

### Connection Management

1. **Use connection pooling** to reduce overhead
2. **Set appropriate timeout values**
3. **Monitor connection pool utilization**
4. **Use read replicas** for reporting queries

### Caching Strategy

1. **Cache frequently accessed data**
2. **Set appropriate TTL values**
3. **Implement cache invalidation**
4. **Monitor cache hit rates**

### Maintenance

1. **Run ANALYZE regularly** for accurate statistics
2. **Schedule VACUUM during off-peak hours**
3. **Monitor table bloat** and REINDEX when needed
4. **Review and optimize unused indexes**

## Performance Testing

### Running Load Tests

```bash
# Install dependencies
npm install

# Run performance tests
npm run test:performance

# Run with custom configuration
node tests/performance/database-load-test.js
```

### Test Scenarios

1. **Concurrent User Load**: 10-100 concurrent users
2. **Query Performance**: Common leave management operations
3. **Connection Pool Test**: Maximum connection capacity
4. **Cache Performance**: Hit rates and response times

## Monitoring and Alerting

### Performance Alerts

- **Slow queries**: >100ms average response time
- **High error rates**: >5% failure rate
- **Cache miss rate**: <95% hit rate
- **Connection pool exhaustion**: >90% utilization

### Health Checks

```typescript
// Example health check endpoint
app.get("/api/health", async (req, res) => {
  const metrics = await databaseMonitoringService.getPerformanceMetrics();
  const isHealthy =
    metrics.cacheHitRate > 95 && metrics.slowQueries.length === 0;

  res.json({
    status: isHealthy ? "healthy" : "degraded",
    metrics,
    timestamp: new Date().toISOString(),
  });
});
```

## Troubleshooting

### Common Issues

#### Slow Queries

1. **Check pg_stat_statements** for slow query identification
2. **Verify index usage** with EXPLAIN ANALYZE
3. **Update table statistics** with ANALYZE
4. **Consider query rewriting** or additional indexes

#### High Memory Usage

1. **Monitor connection pool size**
2. **Check for memory leaks** in application code
3. **Optimize large result sets** with pagination
4. **Review shared_buffers** configuration

#### Connection Issues

1. **Increase connection_limit** in DATABASE_URL
2. **Check for connection leaks** in application
3. **Monitor connection pool** utilization
4. **Implement connection retry logic**

## Future Optimizations

### Planned Enhancements

1. **Redis Integration**: For distributed caching
2. **Read Replica Scaling**: Multiple read replicas for load distribution
3. **Query Result Caching**: Server-side result caching
4. **Connection Pooling**: Advanced pool management features
5. **Database Sharding**: Horizontal scaling for large datasets

### Performance Monitoring

1. **Real-time Dashboards**: Grafana/Prometheus integration
2. **Alert Management**: Automated alerting for performance issues
3. **Performance Trends**: Long-term performance analysis
4. **Capacity Planning**: Resource utilization forecasting

## Conclusion

The database performance optimizations implemented provide a solid foundation for high-performance, scalable operations. Regular monitoring, maintenance, and testing ensure optimal performance as the system grows.

For questions or issues related to database performance, refer to the monitoring dashboard or contact the development team.
