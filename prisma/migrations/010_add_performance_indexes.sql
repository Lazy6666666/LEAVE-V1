-- Migration: Add performance indexes for Leave Management System
-- Created: 2025-01-20
-- Purpose: Optimize database queries for performance

-- Indexes for leaves table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaves_user_status ON leaves(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaves_user_status_created_at ON leaves(user_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaves_dates ON leaves(start_date, end_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaves_status_pending ON leaves(status) WHERE status = 'PENDING';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaves_status_approved ON leaves(status) WHERE status = 'APPROVED';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaves_leave_type ON leaves(leave_type_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaves_approved_by ON leaves(approved_by) WHERE approved_by IS NOT NULL;

-- Indexes for notification_logs table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read ON notification_logs(user_id, read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notification_logs(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON notification_logs(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread ON notification_logs(user_id, read) WHERE read = false;

-- Indexes for company_documents table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_category ON company_documents(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_expiry ON company_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_access_level ON company_documents(access_level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_uploaded_by ON company_documents(uploaded_by);

-- Indexes for audit_logs table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_user_date ON audit_logs(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_entity_type ON audit_logs(entity_type, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);

-- Indexes for users table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Indexes for profiles table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_department ON profiles(department) WHERE department IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_manager_id ON profiles(manager_id) WHERE manager_id IS NOT NULL;

-- Indexes for leave_types table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leave_types_active ON leave_types(active) WHERE active = true;

-- Enable pg_stat_statements for query monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Add comment for monitoring
COMMENT ON INDEX idx_leaves_user_status IS 'Fast lookup for employee leave queries';
COMMENT ON INDEX idx_leaves_user_status_created_at IS 'Composite index for user leave listings with sorting';
COMMENT ON INDEX idx_leaves_dates IS 'Optimize date range queries for calendar';
COMMENT ON INDEX idx_leaves_status_pending IS 'Quick access to pending requests for managers';
COMMENT ON INDEX idx_leaves_status_approved IS 'Quick access to approved requests for calendar';
COMMENT ON INDEX idx_notifications_user_read IS 'Optimize notification queries';
COMMENT ON INDEX idx_notifications_user_unread IS 'Optimize unread notification queries';
COMMENT ON INDEX idx_documents_category IS 'Fast document filtering by category';
COMMENT ON INDEX idx_audit_user_date IS 'Optimize audit trail queries';