import { createClient } from "@/lib/supabase/server";

export interface DatabaseMetrics {
  cacheHitRate: number;
  slowQueries: Array<{
    query: string;
    calls: number;
    total_time: number;
    mean_time: number;
  }>;
  indexUsage: Array<{
    indexName: string;
    tableName: string;
    idxScan: number;
    idxTupRead: number;
    idxTupFetch: number;
  }>;
  bloatMetrics: Array<{
    tableName: string;
    bloatSize: string;
    bloatPercentage: number;
  }>;
}

export class DatabaseMonitoringService {
  private supabase = createClient();

  /**
   * Get cache hit rates for tables and indexes
   */
  async getCacheHitRates() {
    const { data, error } = await this.supabase
      .rpc("get_cache_hit_rates")
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get slow queries from pg_stat_statements
   */
  async getSlowQueries(limit: number = 10) {
    const { data, error } = await this.supabase.rpc("get_slow_queries", {
      limit_count: limit,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get index usage statistics
   */
  async getIndexUsage() {
    const { data, error } = await this.supabase.rpc("get_index_usage");

    if (error) throw error;
    return data;
  }

  /**
   * Get table bloat metrics
   */
  async getBloatMetrics() {
    const { data, error } = await this.supabase.rpc("get_table_bloat");

    if (error) throw error;
    return data;
  }

  /**
   * Get comprehensive database performance metrics
   */
  async getPerformanceMetrics(): Promise<DatabaseMetrics> {
    const [cacheHitRate, slowQueries, indexUsage, bloatMetrics] =
      await Promise.all([
        this.getCacheHitRates(),
        this.getSlowQueries(),
        this.getIndexUsage(),
        this.getBloatMetrics(),
      ]);

    return {
      cacheHitRate: (cacheHitRate as any)?.overall_cache_hit_rate || 0,
      slowQueries: slowQueries || [],
      indexUsage: indexUsage || [],
      bloatMetrics: bloatMetrics || [],
    };
  }

  /**
   * Check if performance targets are met
   */
  async checkPerformanceTargets() {
    const metrics = await this.getPerformanceMetrics();
    const issues = [];

    // Check cache hit rate (target: >99%)
    if (metrics.cacheHitRate < 99) {
      issues.push({
        type: "cache_hit_rate",
        current: metrics.cacheHitRate,
        target: 99,
        message: `Cache hit rate is ${metrics.cacheHitRate}%, below target of 99%`,
      });
    }

    // Check for unused indexes
    const unusedIndexes = metrics.indexUsage.filter(
      (idx) => idx.idxScan === 0 && !idx.indexName.includes("_pkey")
    );
    if (unusedIndexes.length > 0) {
      issues.push({
        type: "unused_indexes",
        count: unusedIndexes.length,
        indexes: unusedIndexes.map((idx) => idx.indexName),
        message: `Found ${unusedIndexes.length} unused indexes`,
      });
    }

    // Check for high bloat (>20%)
    const highBloatTables = metrics.bloatMetrics.filter(
      (table) => table.bloatPercentage > 20
    );
    if (highBloatTables.length > 0) {
      issues.push({
        type: "high_bloat",
        count: highBloatTables.length,
        tables: highBloatTables.map((t) => t.tableName),
        message: `Found ${highBloatTables.length} tables with high bloat (>20%)`,
      });
    }

    // Check for slow queries (>100ms average)
    const slowQueries = metrics.slowQueries.filter((q) => q.mean_time > 100);
    if (slowQueries.length > 0) {
      issues.push({
        type: "slow_queries",
        count: slowQueries.length,
        queries: slowQueries,
        message: `Found ${slowQueries.length} slow queries (>100ms average)`,
      });
    }

    return {
      passed: issues.length === 0,
      issues,
      metrics,
    };
  }
}
