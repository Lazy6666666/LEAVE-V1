/**
 * Leave Repository Implementation
 *
 * Concrete implementation of the leave repository using Prisma.
 * Handles all database operations related to leaves.
 */

import { prisma } from "@/lib/prisma";
import { Leave } from "@prisma/client";
import {
  ILeaveRepository,
  LeaveQueryOptions,
  LeaveCreateData,
  LeaveUpdateData,
  LeaveBalance,
  ConflictCheck,
} from "./interfaces/leave-repository.interface";

export class LeaveRepository implements ILeaveRepository {
  /**
   * Create a new leave request
   */
  async create(data: LeaveCreateData): Promise<Leave> {
    // Calculate days count
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const daysCount =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    return await prisma.leave.create({
      data: {
        user_id: data.userId,
        leave_type_id: data.leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        days_count: daysCount,
        reason: data.reason,
        approved_by: data.approverId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                id: true,
                full_name: true,
                department: true,
                role: true,
              },
            },
          },
        },
        leave_type: true,
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
                id: true,
                full_name: true,
                department: true,
                role: true,
              },
            },
          },
        },
        leave_type: true,
      },
    });
  }

  /**
   * Update a leave request
   */
  async update(id: string, data: LeaveUpdateData): Promise<Leave> {
    const updateData: any = {};

    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.approverComments !== undefined) {
      updateData.manager_comment = data.approverComments;
    }
    if (data.processedAt !== undefined) {
      updateData.approved_at = data.processedAt;
    }

    return await prisma.leave.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                id: true,
                full_name: true,
                department: true,
                role: true,
              },
            },
          },
        },
        leave_type: true,
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

    if (options.userId) where.user_id = options.userId;
    if (options.status) where.status = options.status;
    if (options.leaveTypeId) where.leave_type_id = options.leaveTypeId;
    if (options.startDate || options.endDate) {
      where.OR = [
        {
          AND: [
            { start_date: { lte: options.endDate } },
            { end_date: { gte: options.startDate } },
          ],
        },
      ];
    }

    return await prisma.leave.findMany({
      where,
      include: {
        user: options.includeUser
          ? {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    id: true,
                    full_name: true,
                    department: true,
                    role: true,
                  },
                },
              },
            }
          : false,
        leave_type: options.includeLeaveType ? true : false,
      },
      orderBy: { created_at: "desc" },
      take: options.limit,
      skip: options.offset,
    });
  }

  /**
   * Count leaves based on query options
   */
  async count(options: LeaveQueryOptions): Promise<number> {
    const where: any = {};

    if (options.userId) where.user_id = options.userId;
    if (options.status) where.status = options.status;
    if (options.leaveTypeId) where.leave_type_id = options.leaveTypeId;
    if (options.startDate || options.endDate) {
      where.OR = [
        {
          AND: [
            { start_date: { lte: options.endDate } },
            { end_date: { gte: options.startDate } },
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
      where: { manager_id: managerId },
      select: { user_id: true },
    });

    const userIds = teamMembers.map((m) => m.user_id);

    return await prisma.leave.findMany({
      where: {
        user_id: { in: userIds },
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                id: true,
                full_name: true,
                department: true,
                role: true,
              },
            },
          },
        },
        leave_type: true,
      },
      orderBy: { created_at: "asc" },
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
        user_id: userId,
        OR: [
          {
            AND: [
              { start_date: { lte: endDate } },
              { end_date: { gte: startDate } },
            ],
          },
        ],
      },
      include: {
        leave_type: true,
      },
      orderBy: { start_date: "desc" },
    });
  }

  /**
   * Check for conflicting leave dates
   */
  async findConflicts(conflict: ConflictCheck): Promise<Leave[]> {
    const where: any = {
      user_id: conflict.userId,
      status: { in: ["PENDING", "APPROVED"] },
      OR: [
        {
          AND: [
            { start_date: { lte: conflict.endDate } },
            { end_date: { gte: conflict.startDate } },
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
        leave_type: true,
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
        user_id_leave_type_id_year: {
          user_id: userId,
          leave_type_id: leaveTypeId,
          year,
        },
      },
    });

    if (!balance) return null;

    return {
      userId: balance.user_id,
      leaveTypeId: balance.leave_type_id,
      year: balance.year,
      allocated: balance.total_days,
      used: balance.used_days,
      remaining: balance.remaining_days,
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
        user_id_leave_type_id_year: {
          user_id: userId,
          leave_type_id: leaveTypeId,
          year,
        },
      },
      update: {
        used_days: {
          increment: days,
        },
        remaining_days: {
          decrement: days,
        },
      },
      create: {
        user_id: userId,
        leave_type_id: leaveTypeId,
        year,
        total_days: 0, // This should be set based on company policy
        used_days: days,
        remaining_days: -days, // Temporary, will be updated
      },
    });

    // Fetch the updated balance
    const updated = await prisma.leaveBalance.findUnique({
      where: {
        user_id_leave_type_id_year: {
          user_id: userId,
          leave_type_id: leaveTypeId,
          year,
        },
      },
    });

    if (!updated) {
      throw new Error("Failed to update leave balance");
    }

    return {
      userId: updated.user_id,
      leaveTypeId: updated.leave_type_id,
      year: updated.year,
      allocated: updated.total_days,
      used: updated.used_days,
      remaining: updated.remaining_days,
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
    const where = userId ? { user_id: userId } : {};

    const [total, pending, approved, rejected] = await Promise.all([
      prisma.leave.count({ where }),
      prisma.leave.count({ where: { ...where, status: "PENDING" } }),
      prisma.leave.count({ where: { ...where, status: "APPROVED" } }),
      prisma.leave.count({ where: { ...where, status: "REJECTED" } }),
    ]);

    return { total, pending, approved, rejected };
  }
}
