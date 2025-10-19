-- Supabase Setup for Notification System
-- T-036: Notification System Enhancement
-- Run these commands in your Supabase SQL Editor

-- ============================================
-- 1. Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Create RLS Policies
-- ============================================

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notification_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notification_logs
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: System can insert notifications
-- Note: This allows the API (service role) to create notifications
CREATE POLICY "System can insert notifications"
ON notification_logs
FOR INSERT
WITH CHECK (true);

-- ============================================
-- 3. Enable Realtime for notification_logs
-- ============================================

-- Enable realtime replication for the table
-- Note: You also need to enable this in the Supabase Dashboard:
-- Database → Replication → Enable replication for notification_logs

-- Alternatively, you can use this SQL (if you have the right permissions):
ALTER PUBLICATION supabase_realtime ADD TABLE notification_logs;

-- ============================================
-- 4. Create Indexes for Better Performance
-- ============================================

-- Index for faster queries by user_id and created_at
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
ON notification_logs(user_id, created_at DESC);

-- Index for faster unread queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
ON notification_logs(user_id, read);

-- Index for faster type filtering
CREATE INDEX IF NOT EXISTS idx_notifications_type
ON notification_logs(type);

-- ============================================
-- 5. Create Function to Clean Old Notifications (Optional)
-- ============================================

-- Function to delete notifications older than 90 days
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM notification_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Create a scheduled job to run cleanup weekly (optional)
-- Note: This requires the pg_cron extension
-- SELECT cron.schedule(
--   'cleanup-old-notifications',
--   '0 2 * * 0',  -- Every Sunday at 2 AM
--   'SELECT cleanup_old_notifications();'
-- );

-- ============================================
-- 6. Verify Setup
-- ============================================

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'notification_logs';

-- Check policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'notification_logs';

-- Check indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'notification_logs';

-- ============================================
-- 7. Test Data (Optional - for development)
-- ============================================

-- Insert a test notification for the current user
-- Replace 'USER_UUID_HERE' with an actual user ID from your users table
/*
INSERT INTO notification_logs (user_id, type, title, message, read, link)
VALUES (
  'USER_UUID_HERE',
  'SYSTEM_ANNOUNCEMENT',
  'Test Notification',
  'This is a test notification to verify the system is working',
  false,
  '/notifications'
);
*/

-- ============================================
-- 8. Additional Security (Optional)
-- ============================================

-- Prevent users from deleting notifications
-- (Only allow system/admin to delete)
CREATE POLICY "Users cannot delete notifications"
ON notification_logs
FOR DELETE
USING (false);

-- ============================================
-- 9. Realtime Filters (Client-side - for reference)
-- ============================================

/*
In your client code, you can filter realtime updates by user:

const channel = supabase
  .channel('notification_changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notification_logs',
      filter: `user_id=eq.${userId}`  // Filter by user ID
    },
    (payload) => {
      // Handle new notification
    }
  )
  .subscribe();
*/

-- ============================================
-- Setup Complete!
-- ============================================
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Enable Realtime in Dashboard: Database → Replication
-- 3. Add NotificationBell to your app layout
-- 4. Test by creating a notification
