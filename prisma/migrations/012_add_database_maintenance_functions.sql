-- Migration: Add database maintenance functions
-- Created: 2025-01-20
-- Purpose: Setup maintenance functions for VACUUM, ANALYZE, and REINDEX

-- Create maintenance_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL CHECK (operation IN ('VACUUM', 'ANALYZE', 'REINDEX')),
  table_name TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add indexes for maintenance_logs
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_operation ON maintenance_logs(operation);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_created_at ON maintenance_logs(created_at);

-- Function to run VACUUM
CREATE OR REPLACE FUNCTION run_vacuum(table_name TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  sql TEXT;
BEGIN
  IF table_name IS NOT NULL THEN
    sql := 'VACUUM ANALYZE ' || quote_ident(table_name);
    EXECUTE sql;
    RETURN 'VACUUM completed for table: ' || table_name;
  ELSE
    -- Run VACUUM on all tables
    FOR sql IN
      SELECT 'VACUUM ANALYZE ' || quote_ident(schemaname) || '.' || quote_ident(tablename)
      FROM pg_tables
      WHERE schemaname = 'public'
    LOOP
      EXECUTE sql;
    END LOOP;
    RETURN 'VACUUM completed for all tables';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to run ANALYZE
CREATE OR REPLACE FUNCTION run_analyze(table_name TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  sql TEXT;
BEGIN
  IF table_name IS NOT NULL THEN
    sql := 'ANALYZE ' || quote_ident(table_name);
    EXECUTE sql;
    RETURN 'ANALYZE completed for table: ' || table_name;
  ELSE
    -- Run ANALYZE on all tables
    FOR sql IN
      SELECT 'ANALYZE ' || quote_ident(schemaname) || '.' || quote_ident(tablename)
      FROM pg_tables
      WHERE schemaname = 'public'
    LOOP
      EXECUTE sql;
    END LOOP;
    RETURN 'ANALYZE completed for all tables';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to run REINDEX
CREATE OR REPLACE FUNCTION run_reindex(object_name TEXT)
RETURNS TEXT AS $$
DECLARE
  sql TEXT;
BEGIN
  -- Check if it's a table or index
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = object_name AND relkind = 'r') THEN
    sql := 'REINDEX TABLE ' || quote_ident(object_name);
    EXECUTE sql;
    RETURN 'REINDEX completed for table: ' || object_name;
  ELSIF EXISTS (SELECT 1 FROM pg_class WHERE relname = object_name AND relkind = 'i') THEN
    sql := 'REINDEX INDEX ' || quote_ident(object_name);
    EXECUTE sql;
    RETURN 'REINDEX completed for index: ' || object_name;
  ELSE
    RAISE EXCEPTION 'Object % does not exist or is not a table/index', object_name;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get table statistics
CREATE OR REPLACE FUNCTION get_table_statistics()
RETURNS TABLE(
  table_name TEXT,
  row_count BIGINT,
  total_size_mb NUMERIC,
  index_size_mb NUMERIC,
  bloat_percentage NUMERIC,
  last_vacuum TIMESTAMPTZ,
  last_analyze TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tablename::TEXT as table_name,
    COALESCE(s.n_tup_ins, 0) - COALESCE(s.n_tup_del, 0) as row_count,
    ROUND(pg_total_relation_size(t.oid) / (1024 * 1024)::numeric, 2) as total_size_mb,
    ROUND(pg_relation_size(t.oid) / (1024 * 1024)::numeric, 2) as table_size_mb,
    ROUND(pg_total_relation_size(t.oid) / (1024 * 1024)::numeric, 2) -
      ROUND(pg_relation_size(t.oid) / (1024 * 1024)::numeric, 2) as index_size_mb,
    0 as bloat_percentage, -- This would require more complex calculation
    NULL::timestamptz as last_vacuum,
    NULL::timestamptz as last_analyze
  FROM pg_tables t
  LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname
  WHERE t.schemaname = 'public'
  ORDER BY pg_total_relation_size(t.oid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION run_vacuum(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION run_analyze(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION run_reindex(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_statistics() TO authenticated;

-- Grant permissions on maintenance_logs
GRANT SELECT, INSERT ON maintenance_logs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE maintenance_logs_id_seq TO authenticated;