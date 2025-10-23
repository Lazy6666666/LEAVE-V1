/**
 * Leave Repository Implementation
 *
 * Concrete implementation of the leave repository using Prisma.
 * Handles all database operations related to leaves.
 */

import { prisma } from '@/lib/prisma';
import { Leave, LeaveStatus } from '@prisma/client';
import {
  ILeaveRepository,
  LeaveQueryOptions,
  LeaveCreateData,
  LeaveUpdateData,
  LeaveBalance,
  ConflictCheck,
} from './interfaces/leave-repository.interface';

export class LeaveRepository implements ILeaveRepository {
  /**
   * Create a new leave request
   */
  async create(data: LeaveCreateData): Promise<Leave> {
    return await prisma.leave.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        leaveType: true,
        approver: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find a leave by ID
   */
  async findById(id: string): Promise<Leave | null> {
    return await prisma.leave.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                department: true,
              },
            },
          },
        },
        leaveType: true,
        approver: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update a leave request
   */
  async update(id: string, data: LeaveUpdateData): Promise<Leave> {
    return await prisma.leave.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        leaveType: true,
        approver: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Delete a leave request
   */
  async delete(id: string): Promise<void> {
    await prisma.leave.delete({
      where: { id },
    });
  }

  /**
   * Find multiple leaves based on query options
   */
  async findMany(options: LeaveQueryOptions): Promise<Leave[]> {
    const where: any = {};

    if (options.userId) where.userId = options.userId;
    if (options.status) where.status = options.status;
    if (options.leaveTypeId) where.leaveTypeId = options.leaveTypeId;
    if (options.startDate || options.endDate) {
      where.OR = [
        {
          AND: [
            { startDate: { lte: options.endDate } },
            { endDate: { gte: options.startDate } },
          ],
        },
      ];
    }

    return await prisma.leave.findMany({
      where,
      include: {
        user: options.includeUser ? {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                department: true,
              },
            },
          },
        } : false,
        leaveType: options.includeLeaveType ? true : false,
        approver: options.includeUser ? {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        } : false,
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset,
    });
  }

  /**
   * Count leaves based on query options
   */
  async count(options: LeaveQueryOptions): Promise<number> {
    const where: any = {};

    if (options.userId) where.userId = options.userId;
    if (options.status) where.status = options.status;
    if (options.leaveTypeId) where.leaveTypeId = options.leaveTypeId;
    if (options.startDate || options.endDate) {
      where.OR = [
        {
          AND: [
            { startDate: { lte: options.endDate } },
            { endDate: { gte: options.startDate } },
          ],
        },
      ];
    }

    return await prisma.leave.count({ where });
  }

  /**
   * Find pending leaves for a manager
   */
  async findPendingForManager(managerId: string): Promise<Leave[]> {
    // Get team members for this manager
    const teamMembers = await prisma.profile.findMany({
      where: { managerId },
      select: { userId: true },
    });

    const userIds = teamMembers.map(m => m.userId);

    return await prisma.leave.findMany({
      where: {
        userId: { in: userIds },
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                department: true,
              },
            },
          },
        },
        leaveType: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Find leaves for a specific user in a year
   */
  async findByUser(userId: string, year: number): Promise<Leave[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    return await prisma.leave.findMany({
      where: {
        userId,
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } },
            ],
          },
        ],
      },
      include: {
        leaveType: true,
        approver: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Check for conflicting leave dates
   */
  async findConflicts(conflict: ConflictCheck): Promise<Leave[]> {
    const where: any = {
      userId: conflict.userId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        {
          AND: [
            { startDate: { lte: conflict.endDate } },
            { endDate: { gte: conflict.startDate } },
          ],
        },
      ],
    };

    // Exclude a specific leave ID (for updates)
    if (conflict.excludeLeaveId) {
      where.id = { not: conflict.excludeLeaveId };
    }

    return await prisma.leave.findMany({
      where,
      include: {
        leaveType: true,
      },
    });
  }

  /**
   * Get leave balance for a user
   */
  async getBalance(
    userId: string,
    leaveTypeId: string,
    year: number
  ): Promise<LeaveBalance | null> {
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        userId_leaveTypeId_year: {
          userId,
          leaveTypeId,
          year,
        },
      },
    });

    if (!balance) return null;

    return {
      userId: balance.userId,
      leaveTypeId: balance.leaveTypeId,
      year: balance.year,
      allocated: balance.allocated,
      used: balance.used,
      remaining: balance.remaining,
    };
  }

  /**
   * Update leave balance
   */
  async updateBalance(
    userId: string,
    leaveTypeId: string,
    year: number,
    days: number
  ): Promise<LeaveBalance> {
    // Ensure the balance record exists
    await prisma.leaveBalance.upsert({
      where: {
        userId_leaveTypeId_year: {
          userId,
          leaveTypeId,
          year,
        },
      },
      update: {
        used: {
          increment: days,
        },
        remaining: {
          decrement: days,
        },
      },
      create: {
        userId,
        leaveTypeId,
        year,
        allocated: 0, // This should be set based on company policy
        used: days,
        remaining: -days, // Temporary, will be updated
      },
    });

    // Fetch the updated balance
    const updated = await prisma.leaveBalance.findUnique({
      where: {
        userId_leaveTypeId_year: {
          userId,
          leaveTypeId,
          year,
        },
      },
    });

    if (!updated) {
      throw new Error('Failed to update leave balance');
    }

    return {
      userId: updated.userId,
      leaveTypeId: updated.leaveTypeId,
      year: updated.year,
      allocated: updated.allocated,
      used: updated.used,
      remaining: updated.remaining,
    };
  }

  /**
   * Get leave statistics
   */
  async getStatistics(userId?: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const where = userId ? { userId } : {};

    const [total, pending, approved, rejected] = await Promise.all([
      prisma.leave.count({ where }),
      prisma.leave.count({ where: { ...where, status: 'PENDING' } }),
      prisma.leave.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.leave.count({ where: { ...where, status: 'REJECTED' } }),
    ]);

    return { total, pending, approved, rejected };
  }
}