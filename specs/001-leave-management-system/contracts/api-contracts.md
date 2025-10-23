# API Contracts: Leave Management System

**Created**: 2025-01-20
**Format**: RESTful API specification
**Base URL**: `/api`

## Authentication

All API endpoints (except `/api/auth/*`) require authentication via Supabase JWT token in Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

## Response Format

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}
```

## API Endpoints

### 1. Authentication

#### POST `/api/auth/register`

Register new user

```typescript
// Request
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: "EMPLOYEE";
  department?: string;
}

// Response
interface RegisterResponse {
  user: Profile;
  message: string;
}
```

#### POST `/api/auth/login`

Login user (handled by Supabase)

#### POST `/api/auth/logout`

Logout user (handled by Supabase)

#### POST `/api/auth/reset-password`

Request password reset

```typescript
interface ResetPasswordRequest {
  email: string;
}
```

#### POST `/api/auth/update-password`

Update password with reset token

```typescript
interface UpdatePasswordRequest {
  token: string;
  password: string;
}
```

### 2. Leave Management

#### GET `/api/leaves`

Get leave requests with filtering

```typescript
// Query parameters
interface LeaveQuery {
  status?: LeaveStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Response
interface LeaveResponse {
  leaves: Leave[];
  total: number;
  page: number;
  totalPages: number;
}
```

#### POST `/api/leaves`

Create new leave request

```typescript
// Request
interface CreateLeaveRequest {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

// Response
interface CreateLeaveResponse {
  leave: Leave;
  message: string;
}
```

#### GET `/api/leaves/[id]`

Get specific leave request

```typescript
// Response
interface LeaveDetailResponse {
  leave: Leave & {
    user: Profile;
    leaveType: LeaveType;
    approver?: Profile;
  };
}
```

#### PUT `/api/leaves/[id]/approve`

Approve leave request (Manager/HR only)

```typescript
// Request
interface ApproveLeaveRequest {
  comment?: string;
}

// Response
interface ApproveLeaveResponse {
  leave: Leave;
  message: string;
}
```

#### PUT `/api/leaves/[id]/reject`

Reject leave request (Manager/HR only)

```typescript
// Request
interface RejectLeaveRequest {
  comment: string;
}

// Response
interface RejectLeaveResponse {
  leave: Leave;
  message: string;
}
```

#### PUT `/api/leaves/[id]/cancel`

Cancel leave request (Owner only)

```typescript
// Request
interface CancelLeaveRequest {
  reason: string;
}

// Response
interface CancelLeaveResponse {
  leave: Leave;
  message: string;
}
```

#### POST `/api/leaves/check-conflicts`

Check for leave conflicts

```typescript
// Request
interface CheckConflictsRequest {
  userId: string;
  startDate: string;
  endDate: string;
  excludeId?: string;
}

// Response
interface CheckConflictsResponse {
  hasConflicts: boolean;
  conflicts: {
    leaveId: string;
    dates: string[];
    user: Profile;
  }[];
}
```

### 3. Leave Types

#### GET `/api/leave-types`

Get all leave types

```typescript
// Response
interface LeaveTypesResponse {
  leaveTypes: LeaveType[];
}
```

#### POST `/api/leave-types` (Admin only)

Create new leave type

```typescript
// Request
interface CreateLeaveTypeRequest {
  name: string;
  description: string;
  category: LeaveCategory;
  defaultDays: number;
  requiresApproval: boolean;
  minNoticeDays: number;
  maxConsecutiveDays: number;
  isEncashable: boolean;
  isPaid: boolean;
  color: string;
  icon: string;
}
```

#### PUT `/api/leave-types/[id]` (Admin only)

Update leave type

#### DELETE `/api/leave-types/[id]` (Admin only)

Delete leave type

### 4. Calendar

#### GET `/api/calendar`

Get calendar events

```typescript
// Query parameters
interface CalendarQuery {
  start: string;
  end: string;
  userId?: string;
  department?: string;
  leaveTypeIds?: string[];
  includePending?: boolean;
}

// Response
interface CalendarResponse {
  events: CalendarEvent[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
  type: "LEAVE" | "HOLIDAY" | "EVENT";
  userId?: string;
  userName: string;
  department: string;
  leaveType: string;
  status: LeaveStatus;
}
```

#### GET `/api/calendar/conflicts`

Get calendar conflicts

```typescript
// Query parameters
interface ConflictQuery {
  start: string;
  end: string;
  department?: string;
  minCoverage?: number;
}

// Response
interface ConflictResponse {
  conflicts: ConflictWarning[];
}

interface ConflictWarning {
  date: string;
  department: string;
  totalOnLeave: number;
  availableUsers: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  affectedUsers: string[];
}
```

### 5. Documents

#### GET `/api/documents`

Get documents with filtering

```typescript
// Query parameters
interface DocumentQuery {
  category?: DocumentCategory;
  search?: string;
  page?: number;
  limit?: number;
}

// Response
interface DocumentsResponse {
  documents: CompanyDocument[];
  total: number;
  page: number;
  totalPages: number;
}
```

#### POST `/api/documents` (HR/Admin only)

Upload document

```typescript
// Request (multipart/form-data)
interface UploadDocumentRequest {
  file: File;
  name: string;
  description: string;
  category: DocumentCategory;
  accessLevel: AccessLevel;
  allowedRoles?: UserRole[];
  expiryDate?: string;
}

// Response
interface UploadDocumentResponse {
  document: CompanyDocument;
  message: string;
}
```

#### GET `/api/documents/[id]`

Get document metadata

#### GET `/api/documents/[id]/download`

Download document file

#### PUT `/api/documents/[id]` (Owner/HR/Admin only)

Update document

#### DELETE `/api/documents/[id]` (Owner/HR/Admin only)

Delete document

#### GET `/api/documents/expiry`

Get documents nearing expiry

```typescript
// Query parameters
interface ExpiryQuery {
  days?: number; // Default: 30
  category?: DocumentCategory;
}

// Response
interface ExpiryResponse {
  documents: CompanyDocument[];
}
```

### 6. Notifications

#### GET `/api/notifications`

Get user notifications

```typescript
// Query parameters
interface NotificationQuery {
  unreadOnly?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

// Response
interface NotificationsResponse {
  notifications: NotificationLog[];
  unreadCount: number;
  total: number;
}
```

#### PUT `/api/notifications/[id]/read`

Mark notification as read

```typescript
// Response
interface MarkReadResponse {
  message: string;
}
```

#### PUT `/api/notifications/read-all`

Mark all notifications as read

```typescript
// Response
interface MarkAllReadResponse {
  message: string;
  markedCount: number;
}
```

### 7. Search

#### GET `/api/search`

Global search

```typescript
// Query parameters
interface SearchQuery {
  q: string; // Search query
  type?: "all" | "leaves" | "documents" | "users";
  limit?: number;
}

// Response
interface SearchResponse {
  leaves: Leave[];
  documents: CompanyDocument[];
  users: Profile[];
  total: number;
}
```

### 8. Admin APIs

#### GET `/api/admin/users` (Admin/HR only)

Get all users

```typescript
// Query parameters
interface AdminUserQuery {
  role?: UserRole;
  department?: string;
  status?: UserStatus;
  search?: string;
}
```

#### POST `/api/admin/users` (Admin only)

Create new user

#### GET `/api/admin/users/[id]` (Admin/HR only)

Get user details

#### PUT `/api/admin/users/[id]` (Admin only)

Update user

#### DELETE `/api/admin/users/[id]` (Admin only)

Delete user

#### GET `/api/admin/settings` (Admin only)

Get system settings

#### PUT `/api/admin/settings` (Admin only)

Update system settings

### 9. Dashboard Data

#### GET `/api/dashboard/stats`

Get dashboard statistics

```typescript
// Response
interface DashboardStatsResponse {
  myStats: {
    totalLeaves: number;
    approvedLeaves: number;
    pendingLeaves: number;
    rejectedLeaves: number;
    balances: LeaveBalance[];
  };
  teamStats?: {
    totalRequests: number;
    pendingApprovals: number;
    onLeaveToday: number;
    conflictsThisMonth: number;
  };
}
```

## Error Codes

| Status | Code             | Description                                 |
| ------ | ---------------- | ------------------------------------------- |
| 400    | INVALID_REQUEST  | Invalid request parameters                  |
| 401    | UNAUTHORIZED     | Authentication required                     |
| 403    | FORBIDDEN        | Insufficient permissions                    |
| 404    | NOT_FOUND        | Resource not found                          |
| 409    | CONFLICT         | Resource conflict (e.g., overlapping leave) |
| 422    | VALIDATION_ERROR | Input validation failed                     |
| 429    | RATE_LIMITED     | Too many requests                           |
| 500    | INTERNAL_ERROR   | Server error                                |

## Rate Limits

- Auth endpoints: 5 requests per minute
- File upload: 10 requests per minute
- Other endpoints: 100 requests per minute per user

## Webhooks (Future)

### `leave.approved`

Triggered when leave is approved

```typescript
interface LeaveApprovedWebhook {
  event: "leave.approved";
  data: {
    leave: Leave;
    user: Profile;
    approver: Profile;
  };
  timestamp: string;
}
```

### `leave.rejected`

Triggered when leave is rejected

```typescript
interface LeaveRejectedWebhook {
  event: "leave.rejected";
  data: {
    leave: Leave;
    user: Profile;
    approver: Profile;
  };
  timestamp: string;
}
```
