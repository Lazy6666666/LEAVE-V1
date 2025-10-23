-- Migration: Add database monitoring functions
-- Created: 2025-01-20
-- Purpose: Setup monitoring functions for performance tracking

-- Function to get cache hit rates
CREATE OR REPLACE FUNCTION get_cache_hit_rates()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'table_hit_rate', ROUND(
      (sum(heap_blks_hit)::numeric / NULLIF(sum(heap_blks_hit + heap_blks_read), 0)) * 100, 2
    ),
    'index_hit_rate', ROUND(
      (sum(idx_blks_hit)::numeric / NULLIF(sum(idx_blks_hit + idx_blks_read), 0)) * 100, 2
    ),
    'overall_cache_hit_rate', ROUND(
      ((sum(heap_blks_hit) + sum(idx_blks_hit))::numeric /
       NULLIF((sum(heap_blks_hit) + sum(heap_blks_read) + sum(idx_blks_hit) + sum(idx_blks_read)), 0)) * 100, 2
    )
  ) INTO result
  FROM pg_statio_user_tables;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get slow queries
CREATE OR REPLACE FUNCTION get_slow_queries(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  query TEXT,
  calls BIGINT,
  total_time DOUBLE PRECISION,
  mean_time DOUBLE PRECISION,
  rows BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    LEFT(pg_stat_statements.query, 100) as query,
    pg_stat_statements.calls,
    ROUND(pg_stat_statements.total_exec_time::numeric, 2) as total_time,
    ROUND(pg_stat_statements.mean_exec_time::numeric, 2) as mean_time,
    pg_stat_statements.rows
  FROM pg_stat_statements
  WHERE pg_stat_statements.calls > 10
  ORDER BY pg_stat_statements.mean_exec_time DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get index usage
CREATE OR REPLACE FUNCTION get_index_usage()
RETURNS TABLE(
  index_name TEXT,
  table_name TEXT,
  idx_scan BIGINT,
  idx_tup_read BIGINT,
  idx_tup_fetch BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname || '.' || indexname as index_name,
    schemaname || '.' || tablename as table_name,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get table bloat
CREATE OR REPLACE FUNCTION get_table_bloat()
RETURNS TABLE(
  table_name TEXT,
  bloat_size TEXT,
  bloat_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH bloat_info AS (
    SELECT
      schemaname || '.' || tablename as table_name,
      pg_size_pretty(bloat_size) as bloat_size,
      ROUND(bloat_size * 100 / NULLIF(bloat_size + tbl_size, 0), 2) as bloat_percentage
    FROM (
      SELECT
        schemaname,
        tablename,
        ((bs * 8192) - tups * 24) as bloat_size,
        tbl_size
      FROM (
        SELECT
          schemaname,
          tablename,
          ((relpages * 8) - (reltuples * 24)) as bs,
          relpages * 8 as tbl_size,
          reltuples as tups
        FROM pg_class
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        WHERE relkind = 'r'
        AND schemaname = 'public'
      ) AS sub
    ) AS sub2
    WHERE bloat_size > 0
  )
  SELECT * FROM bloat_info
  WHERE bloat_percentage > 10
  ORDER BY bloat_percentage DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_cache_hit_rates() TO authenticated;
GRANT EXECUTE ON FUNCTION get_slow_queries(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_index_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_bloat() TO authenticated;