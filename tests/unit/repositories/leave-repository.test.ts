/**
 * Leave Repository Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { LeaveRepository } from '@/lib/repositories/leave-repository';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    leave: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    profile: {
      findMany: jest.fn(),
    },
    leaveBalance: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

describe('LeaveRepository', () => {
  let repository: LeaveRepository;

  beforeEach(() => {
    repository = new LeaveRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new leave request', async () => {
      const mockLeaveData = {
        userId: 'user-1',
        leaveTypeId: 'leave-type-1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-03'),
        reason: 'Test leave',
      };

      const mockLeave = {
        id: 'leave-1',
        ...mockLeaveData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'PENDING',
      };

      (prisma.leave.create as jest.Mock).mockResolvedValue(mockLeave);

      const result = await repository.create(mockLeaveData);

      expect(prisma.leave.create).toHaveBeenCalledWith({
        data: {
          ...mockLeaveData,
          startDate: new Date(mockLeaveData.startDate),
          endDate: new Date(mockLeaveData.endDate),
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockLeave);
    });
  });

  describe('findById', () => {
    it('should find a leave by ID', async () => {
      const mockLeave = {
        id: 'leave-1',
        userId: 'user-1',
        status: 'PENDING',
      };

      (prisma.leave.findUnique as jest.Mock).mockResolvedValue(mockLeave);

      const result = await repository.findById('leave-1');

      expect(prisma.leave.findUnique).toHaveBeenCalledWith({
        where: { id: 'leave-1' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockLeave);
    });

    it('should return null if leave not found', async () => {
      (prisma.leave.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findConflicts', () => {
    it('should find conflicting leaves for given dates', async () => {
      const conflict = {
        userId: 'user-1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-03'),
      };

      const mockConflicts = [
        {
          id: 'leave-2',
          userId: 'user-1',
          startDate: new Date('2024-01-02'),
          endDate: new Date('2024-01-04'),
          status: 'APPROVED',
        },
      ];

      (prisma.leave.findMany as jest.Mock).mockResolvedValue(mockConflicts);

      const result = await repository.findConflicts(conflict);

      expect(prisma.leave.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: { in: ['PENDING', 'APPROVED'] },
          OR: [
            {
              AND: [
                { startDate: { lte: conflict.endDate } },
                { endDate: { gte: conflict.startDate } },
              ],
            },
          ],
        },
        include: {
          leaveType: true,
        },
      });
      expect(result).toEqual(mockConflicts);
    });

    it('should exclude specific leave ID from conflict check', async () => {
      const conflict = {
        userId: 'user-1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-03'),
        excludeLeaveId: 'leave-1',
      };

      (prisma.leave.findMany as jest.Mock).mockResolvedValue([]);

      await repository.findConflicts(conflict);

      expect(prisma.leave.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: { in: ['PENDING', 'APPROVED'] },
          id: { not: 'leave-1' },
          OR: [
            {
              AND: [
                { startDate: { lte: conflict.endDate } },
                { endDate: { gte: conflict.startDate } },
              ],
            },
          ],
        },
        include: {
          leaveType: true,
        },
      });
    });
  });

  describe('updateBalance', () => {
    it('should update leave balance for user', async () => {
      const userId = 'user-1';
      const leaveTypeId = 'leave-type-1';
      const year = 2024;
      const days = 2;

      const mockBalance = {
        userId,
        leaveTypeId,
        year,
        allocated: 20,
        used: 2,
        remaining: 18,
      };

      (prisma.leaveBalance.upsert as jest.Mock).mockResolvedValue(mockBalance);
      (prisma.leaveBalance.findUnique as jest.Mock).mockResolvedValue(mockBalance);

      const result = await repository.updateBalance(userId, leaveTypeId, year, days);

      expect(prisma.leaveBalance.upsert).toHaveBeenCalledWith({
        where: {
          userId_leaveTypeId_year: {
            userId,
            leaveTypeId,
            year,
          },
        },
        update: {
          used: { increment: days },
          remaining: { decrement: days },
        },
        create: {
          userId,
          leaveTypeId,
          year,
          allocated: 0,
          used: days,
          remaining: -days,
        },
      });
      expect(result).toEqual({
        userId: mockBalance.userId,
        leaveTypeId: mockBalance.leaveTypeId,
        year: mockBalance.year,
        allocated: mockBalance.allocated,
        used: mockBalance.used,
        remaining: mockBalance.remaining,
      });
    });
  });

  describe('getStatistics', () => {
    it('should return leave statistics', async () => {
      const mockCounts = [10, 3, 5, 2];
      (prisma.leave.count as jest.Mock)
        .mockResolvedValueOnce(mockCounts[0])
        .mockResolvedValueOnce(mockCounts[1])
        .mockResolvedValueOnce(mockCounts[2])
        .mockResolvedValueOnce(mockCounts[3]);

      const result = await repository.getStatistics();

      expect(result).toEqual({
        total: 10,
        pending: 3,
        approved: 5,
        rejected: 2,
      });
    });

    it('should return statistics for specific user', async () => {
      const userId = 'user-1';
      const mockCounts = [5, 1, 3, 1];
      (prisma.leave.count as jest.Mock)
        .mockResolvedValueOnce(mockCounts[0])
        .mockResolvedValueOnce(mockCounts[1])
        .mockResolvedValueOnce(mockCounts[2])
        .mockResolvedValueOnce(mockCounts[3]);

      const result = await repository.getStatistics(userId);

      expect(result).toEqual({
        total: 5,
        pending: 1,
        approved: 3,
        rejected: 1,
      });

      // Verify all calls were made with the userId filter
      expect(prisma.leave.count).toHaveBeenCalledTimes(4);
      expect(prisma.leave.count).toHaveBeenCalledWith({ where: { userId } });
    });
  });
});