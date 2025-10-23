/**
 * Leave Repository Interface
 *
 * Defines the contract for leave data access operations.
 * This enables easy testing and swapping of implementations.
 */

import { Leave, LeaveStatus, LeaveType } from '@prisma/client';

export interface LeaveQueryOptions {
  userId?: string;
  status?: LeaveStatus;
  leaveTypeId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  includeUser?: boolean;
  includeLeaveType?: boolean;
}

export interface LeaveCreateData {
  userId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  attachments?: string[];
  approverId?: string;
}

export interface LeaveUpdateData {
  status?: LeaveStatus;
  approverComments?: string;
  processedAt?: Date;
  attachments?: string[];
}

export interface LeaveBalance {
  userId: string;
  leaveTypeId: string;
  year: number;
  allocated: number;
  used: number;
  remaining: number;
}

export interface ConflictCheck {
  userId: string;
  startDate: Date;
  endDate: Date;
  excludeLeaveId?: string;
}

/**
 * Repository interface for Leave operations
 */
export interface ILeaveRepository {
  // Basic CRUD operations
  create(data: LeaveCreateData): Promise<Leave>;
  findById(id: string): Promise<Leave | null>;
  update(id: string, data: LeaveUpdateData): Promise<Leave>;
  delete(id: string): Promise<void>;

  // Query operations
  findMany(options: LeaveQueryOptions): Promise<Leave[]>;
  count(options: LeaveQueryOptions): Promise<number>;

  // Business-specific operations
  findPendingForManager(managerId: string): Promise<Leave[]>;
  findByUser(userId: string, year: number): Promise<Leave[]>;
  findConflicts(conflict: ConflictCheck): Promise<Leave[]>;

  // Balance operations
  getBalance(userId: string, leaveTypeId: string, year: number): Promise<LeaveBalance | null>;
  updateBalance(userId: string, leaveTypeId: string, year: number, days: number): Promise<LeaveBalance>;

  // Statistics
  getStatistics(userId?: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }>;
}