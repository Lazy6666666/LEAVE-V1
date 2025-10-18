/**
 * Leave Balance Calculation Service
 * T-010: Leave Balance Management
 */

import { prisma } from '@/lib/prisma';

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  annualQuota: number;
  usedDays: number;
  availableDays: number;
}

export interface LeaveValidationResult {
  isValid: boolean;
  message?: string;
  availableBalance?: number;
}

/**
 * Calculate user's leave balance for a specific leave type
 */
export async function calculateUserLeaveBalance(
  userId: string,
  leaveTypeId: string,
  year: number = new Date().getFullYear()
): Promise<LeaveBalance | null> {
  try {
    // Get leave type details
    const leaveType = await prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
    });

    if (!leaveType || !leaveType.active) {
      return null;
    }

    // Calculate used days from approved leaves in the specified year
    const approvedLeaves = await prisma.leave.findMany({
      where: {
        user_id: userId,
        leave_type_id: leaveTypeId,
        status: 'APPROVED',
        start_date: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
    });

    const usedDays = approvedLeaves.reduce(
      (total, leave) => total + leave.days_count,
      0
    );

    return {
      leaveTypeId: leaveType.id,
      leaveTypeName: leaveType.name,
      annualQuota: leaveType.annual_quota,
      usedDays,
      availableDays: leaveType.annual_quota - usedDays,
    };
  } catch (error) {
    console.error('Error calculating leave balance:', error);
    throw new Error('Failed to calculate leave balance');
  }
}

/**
 * Validate if user has sufficient balance for a leave request
 */
export async function validateLeaveRequest(
  userId: string,
  leaveTypeId: string,
  daysCount: number,
  year: number = new Date().getFullYear()
): Promise<LeaveValidationResult> {
  try {
    const balance = await calculateUserLeaveBalance(userId, leaveTypeId, year);

    if (!balance) {
      return {
        isValid: false,
        message: 'Invalid leave type or leave type is not active',
      };
    }

    if (daysCount <= 0) {
      return {
        isValid: false,
        message: 'Leave duration must be greater than 0 days',
      };
    }

    if (balance.availableDays < daysCount) {
      return {
        isValid: false,
        message: `Insufficient leave balance. Available: ${balance.availableDays} days, Requested: ${daysCount} days`,
        availableBalance: balance.availableDays,
      };
    }

    return {
      isValid: true,
      availableBalance: balance.availableDays,
    };
  } catch (error) {
    console.error('Error validating leave request:', error);
    return {
      isValid: false,
      message: 'Failed to validate leave request',
    };
  }
}

/**
 * Get all leave balances for a user
 */
export async function getAllUserBalances(
  userId: string,
  year: number = new Date().getFullYear()
): Promise<LeaveBalance[]> {
  try {
    // Get all active leave types
    const leaveTypes = await prisma.leaveType.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    // Calculate balance for each leave type
    const balances = await Promise.all(
      leaveTypes.map(async (leaveType) => {
        const balance = await calculateUserLeaveBalance(
          userId,
          leaveType.id,
          year
        );
        return balance;
      })
    );

    return balances.filter((balance): balance is LeaveBalance => balance !== null);
  } catch (error) {
    console.error('Error getting all user balances:', error);
    throw new Error('Failed to retrieve leave balances');
  }
}

/**
 * Check for overlapping leave requests
 */
export async function checkOverlappingLeaves(
  userId: string,
  startDate: Date,
  endDate: Date,
  excludeLeaveId?: string
): Promise<boolean> {
  try {
    const overlapping = await prisma.leave.findFirst({
      where: {
        user_id: userId,
        id: excludeLeaveId ? { not: excludeLeaveId } : undefined,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            start_date: { lte: endDate },
            end_date: { gte: startDate },
          },
        ],
      },
    });

    return !!overlapping;
  } catch (error) {
    console.error('Error checking overlapping leaves:', error);
    throw new Error('Failed to check for overlapping leaves');
  }
}

/**
 * Calculate number of working days between two dates (excluding weekends)
 */
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    // Exclude Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}
