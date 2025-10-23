-- Create error_logs table for centralized error tracking
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  stack TEXT,
  url TEXT,
  method VARCHAR(10),
  headers JSONB,
  user_agent TEXT,
  user_id UUID REFERENCES users(id),
  severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_url ON error_logs(url);

-- Create RLS policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can see their own errors
CREATE POLICY "Users can view their own errors" ON error_logs
  FOR SELECT USING (
    auth.uid() = user_id OR
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'HR')
    ))
  );

-- Only system can insert errors
CREATE POLICY "System can insert errors" ON error_logs
  FOR INSERT WITH CHECK (true);

-- Admin and HR can update errors
CREATE POLICY "Admin and HR can resolve errors" ON error_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'HR')
    )
  );

-- Add comments
COMMENT ON TABLE error_logs IS 'Centralized error logging table for tracking application errors';
COMMENT ON COLUMN error_logs.message IS 'Error message';
COMMENT ON COLUMN error_logs.stack IS 'Error stack trace';
COMMENT ON COLUMN error_logs.url IS 'Request URL where error occurred';
COMMENT ON COLUMN error_logs.method IS 'HTTP method';
COMMENT ON COLUMN error_logs.headers IS 'Request headers';
COMMENT ON COLUMN error_logs.user_agent IS 'User agent string';
COMMENT ON COLUMN error_logs.severity IS 'Error severity level';
COMMENT ON COLUMN error_logs.resolved IS 'Whether the error has been resolved';
COMMENT ON COLUMN error_logs.resolved_at IS 'Timestamp when error was resolved';
COMMENT ON COLUMN error_logs.resolved_by IS 'User who resolved the error';