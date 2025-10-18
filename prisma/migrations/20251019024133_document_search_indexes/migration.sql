-- Document Search Optimization Indexes
-- Phase 4: T-026 - Search & Filter Backend

-- Index on title for text search
CREATE INDEX IF NOT EXISTS idx_documents_title ON company_documents(title);

-- Index on category for filtering
CREATE INDEX IF NOT EXISTS idx_documents_category ON company_documents(category);

-- Index on uploaded_at for sorting
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON company_documents(uploaded_at DESC);

-- Index on created_at for date range filtering
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON company_documents(created_at);

-- Index on expiry_date for expiry filtering and sorting
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON company_documents(expiry_date) WHERE expiry_date IS NOT NULL;

-- Index on uploaded_by for filtering by uploader
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON company_documents(uploaded_by);

-- Index on access_level for permission filtering
CREATE INDEX IF NOT EXISTS idx_documents_access_level ON company_documents(access_level);

-- GIN index on tags array for efficient tag filtering
CREATE INDEX IF NOT EXISTS idx_documents_tags ON company_documents USING GIN(tags);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_documents_category_created_at ON company_documents(category, created_at DESC);
