# Data Model: Leave Management System

**Created**: 2025-10-20
**Purpose**: Define data entities and relationships for the leave management system

## Core Entities

### User / Profile

```typescript
interface Profile {
  id: string; // UUID from Supabase Auth
  email: string; // User's email (from auth)
  name: string; // Full name
  role: UserRole; // EMPLOYEE | MANAGER | HR | ADMIN
  department: string; // Department name
  managerId?: string; // Foreign key to Profile (for employees)
  createdAt: Date;
  updatedAt: Date;
}
```

### Leave Type

```typescript
interface LeaveType {
  id: string; // UUID
  name: string; // e.g., "Annual Leave", "Sick Leave"
  description?: string;
  daysAllowed: number; // Annual allocation
  requiresApproval: boolean;
  maxConsecutiveDays?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Leave Request

```typescript
interface Leave {
  id: string; // UUID
  userId: string; // Foreign key to Profile
  leaveTypeId: string; // Foreign key to LeaveType
  startDate: Date;
  endDate: Date;
  daysCount: number; // Calculated based on dates
  reason?: string;
  status: LeaveStatus; // PENDING | APPROVED | REJECTED | CANCELLED
  managerId?: string; // Foreign key to Profile (approving manager)
  managerComments?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Leave Balance

```typescript
interface LeaveBalance {
  id: string; // UUID
  userId: string; // Foreign key to Profile
  leaveTypeId: string; // Foreign key to LeaveType
  totalAllocated: number; // Total days for period
  daysUsed: number; // Approved days used
  daysReserved: number; // Pending requests
  periodYear: number; // Calendar year
  carryOver: number; // Days carried from previous year
  updatedAt: Date;
}
```

### Document

```typescript
interface CompanyDocument {
  id: string; // UUID
  title: string;
  description?: string;
  category: string;
  tags: string[]; // Array of tags
  filePath: string; // Path in Supabase Storage
  fileName: string; // Original filename
  fileSize: number; // Size in bytes
  mimeType: string;
  accessLevel: AccessLevel; // PUBLIC | ROLE_RESTRICTED | PRIVATE
  allowedRoles?: UserRole[]; // Roles that can access
  uploadedBy: string; // Foreign key to Profile
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification

```typescript
interface NotificationLog {
  id: string; // UUID
  userId: string; // Recipient (Foreign key to Profile)
  type: NotificationType; // LEAVE_CREATED | LEAVE_APPROVED | etc.
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId?: string; // ID of related leave/document
  relatedEntityType?: string;
  createdAt: Date;
  readAt?: Date;
}
```

### Audit Log

```typescript
interface AuditLog {
  id: string; // UUID
  userId: string; // Who performed action
  action: AuditAction; // LEAVE_APPROVED | ROLE_CHANGED | etc.
  entityType: string; // Type of entity affected
  entityId: string; // ID of affected entity
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

## Enums

```typescript
enum UserRole {
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  HR = "HR",
  ADMIN = "ADMIN",
}

enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

enum AccessLevel {
  PUBLIC = "PUBLIC",
  ROLE_RESTRICTED = "ROLE_RESTRICTED",
  PRIVATE = "PRIVATE",
}

enum NotificationType {
  LEAVE_CREATED = "LEAVE_CREATED",
  LEAVE_APPROVED = "LEAVE_APPROVED",
  LEAVE_REJECTED = "LEAVE_REJECTED",
  LEAVE_CANCELLED = "LEAVE_CANCELLED",
  DOCUMENT_EXPIRING = "DOCUMENT_EXPIRING",
  DOCUMENT_EXPIRED = "DOCUMENT_EXPIRED",
  ROLE_CHANGED = "ROLE_CHANGED",
}

enum AuditAction {
  LEAVE_SUBMITTED = "LEAVE_SUBMITTED",
  LEAVE_APPROVED = "LEAVE_APPROVED",
  LEAVE_REJECTED = "LEAVE_REJECTED",
  LEAVE_CANCELLED = "LEAVE_CANCELLED",
  DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED",
  DOCUMENT_ACCESSED = "DOCUMENT_ACCESSED",
  ROLE_ASSIGNED = "ROLE_ASSIGNED",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
}
```

## Relationships

```
Profile (1) ──────── (N) Leave
   │                     │
   │                     │
   │                LeaveType (1)
   │                     │
   │                (N) LeaveBalance (1)
   │
Profile (1) ──────── (N) CompanyDocument
   │
Profile (1) ──────── (N) NotificationLog
   │
Profile (1) ──────── (N) AuditLog
```

## Validation Rules

### Leave Request Validation

- Start date must be before end date
- Minimum 1 day, maximum based on leave type
- No overlapping dates for same user
- Sufficient balance must be available
- Manager cannot be the requestor

### Document Validation

- File size max 10MB
- Allowed types: PDF, DOCX, XLSX, JPG, PNG
- Expiry date must be future date
- Access level must match role permissions

### Balance Calculation

- Total = Allocated + CarryOver
- Available = Total - Used - Reserved
- Updated on approval/rejection/cancellation
- Carryover calculated annually

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_leaves_user_status ON leaves(user_id, status);
CREATE INDEX idx_leaves_dates ON leaves(start_date, end_date);
CREATE INDEX idx_notifications_user_read ON notification_logs(user_id, is_read);
CREATE INDEX idx_documents_category ON company_documents(category);
CREATE INDEX idx_audit_user_date ON audit_logs(user_id, created_at);
```
