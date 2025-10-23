// Generated types for Leave Management System

export enum UserRole {
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  HR = "HR",
  ADMIN = "ADMIN",
}

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum AccessLevel {
  PUBLIC = "PUBLIC",
  ROLE_RESTRICTED = "ROLE_RESTRICTED",
  PRIVATE = "PRIVATE",
}

export enum NotificationType {
  LEAVE_CREATED = "LEAVE_CREATED",
  LEAVE_APPROVED = "LEAVE_APPROVED",
  LEAVE_REJECTED = "LEAVE_REJECTED",
  LEAVE_CANCELLED = "LEAVE_CANCELLED",
  DOCUMENT_EXPIRING = "DOCUMENT_EXPIRING",
  DOCUMENT_EXPIRED = "DOCUMENT_EXPIRED",
  ROLE_CHANGED = "ROLE_CHANGED",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  daysAllowed: number;
  requiresApproval: boolean;
  maxConsecutiveDays?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Leave {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  daysCount: number;
  reason?: string;
  status: LeaveStatus;
  managerId?: string;
  managerComments?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Joined fields
  user?: User;
  leaveType?: LeaveType;
  manager?: User;
}

export interface LeaveBalance {
  id: string;
  userId: string;
  leaveTypeId: string;
  totalAllocated: number;
  daysUsed: number;
  daysReserved: number;
  periodYear: number;
  carryOver: number;
  updatedAt: Date;

  // Computed
  available?: number;

  // Joined fields
  leaveType?: LeaveType;
}

export interface CompanyDocument {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  accessLevel: AccessLevel;
  allowedRoles?: UserRole[];
  uploadedBy: string;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Joined fields
  uploader?: User;
}

export interface NotificationLog {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: Date;
  readAt?: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color: string;
  extendedProps: {
    user: User;
    leaveType: string;
    status: LeaveStatus;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// API Request/Response Types
export interface CreateLeaveRequest {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface ApproveLeaveRequest {
  comments?: string;
}

export interface RejectLeaveRequest {
  comments: string;
}

export interface UploadDocument {
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  expiryDate?: string;
  accessLevel: AccessLevel;
  allowedRoles?: UserRole[];
}

export interface CalendarFilters {
  start: string;
  end: string;
  department?: string;
  userId?: string;
}

export interface NotificationPreferences {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
}

// Form Types
export interface LeaveRequestForm {
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export interface DocumentUploadForm {
  title: string;
  description?: string;
  category: string;
  tags: string[];
  expiryDate?: Date;
  accessLevel: AccessLevel;
  allowedRoles: UserRole[];
}

export interface UserEditForm {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  managerId?: string;
}

// Dashboard Types
export interface DashboardStats {
  pendingRequests: number;
  approvedThisMonth: number;
  totalBalance: {
    [leaveTypeId: string]: {
      allocated: number;
      used: number;
      available: number;
    };
  };
  teamAvailability: {
    date: string;
    present: number;
    onLeave: number;
  }[];
}

export interface TeamMemberAvailability {
  user: User;
  leaveRequests: Leave[];
  availabilityStatus: "AVAILABLE" | "ON_LEAVE" | "PARTIAL_LEAVE";
}

// Search Types
export interface SearchFilters {
  query?: string;
  status?: LeaveStatus;
  leaveType?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  department?: string;
}
