// Document Management Types
// Phase 4: T-024, T-025, T-026

// Enums from Prisma
enum Role {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  HR = 'HR'
}

enum AccessLevel {
  PUBLIC = 'PUBLIC',
  EMPLOYEE = 'EMPLOYEE', 
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  HR = 'HR'
}

// Core Document Interface
export interface CompanyDocument {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  category: string;
  tags: string[];
  uploaded_by: string;
  access_level: AccessLevel;
  expiry_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Document with uploader info
export interface DocumentWithUploader extends CompanyDocument {
  uploader: {
    id: string;
    email: string;
    profile: {
      full_name: string;
      role: Role;
      department: string | null;
      avatar_url: string | null;
    } | null;
  };
}

// Document Categories
export type DocumentCategory =
  | "Policy"
  | "Procedure"
  | "Handbook"
  | "Form"
  | "Template"
  | "Announcement"
  | "Training"
  | "Compliance"
  | "Other";

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  "Policy",
  "Procedure",
  "Handbook",
  "Form",
  "Template",
  "Announcement",
  "Training",
  "Compliance",
  "Other",
];

// Document Access Control
export interface DocumentAccessCheck {
  canView: boolean;
  canDownload: boolean;
  canEdit: boolean;
  canDelete: boolean;
  reason?: string;
}

// Document Search and Filter Parameters
export interface DocumentSearchParams {
  query?: string;
  categories?: string[];
  tags?: string[];
  uploadedBy?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  expiryStatus?: "all" | "expiring" | "expired";
  accessLevel?: AccessLevel;
  sortBy?: "title" | "uploadedAt" | "fileSize" | "category" | "expiryDate";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Document Search Result
export interface DocumentSearchResult {
  documents: DocumentWithUploader[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// Document Expiry Status
export interface DocumentExpiryStatus {
  isExpired: boolean;
  daysUntilExpiry: number | null;
  expiryDate: Date | null;
  status: "expired" | "expiring_soon" | "valid" | "no_expiry";
}

// Audit Action Types
export type DocumentAuditAction =
  | "UPLOAD"
  | "VIEW"
  | "DOWNLOAD"
  | "EDIT"
  | "DELETE"
  | "ACCESS_DENIED";

// Expiry thresholds (in days)
export const EXPIRY_THRESHOLDS = {
  CRITICAL: 7,
  WARNING: 14,
  NOTICE: 30,
} as const;

// Storage bucket name
export const DOCUMENTS_BUCKET = "company-documents" as const;
