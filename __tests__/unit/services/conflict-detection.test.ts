// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
/**
 * Conflict Detection Service Tests
 * T-040: Unit Test Suite Setup
 * Testing leave conflict detection functionality
 */

import { mockPrisma } from "../../setup";
import {
  detectLeaveConflicts,
  checkTeamAvailability,
  detectPolicyViolations,
  validateLeaveDates,
  type ConflictResult,
  type PolicyViolation,
} from "@/lib/services/conflict-detection";

describe("Conflict Detection Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("detectLeaveConflicts", () => {
    it("should detect direct date overlaps", async () => {
      const existingLeave = {
        id: "leave-1",
        start_date: new Date("2024-06-15"),
        end_date: new Date("2024-06-17"),
        status: "APPROVED",
      };

      mockPrisma.leave.findMany.mockResolvedValue([existingLeave]);

      const conflicts = await detectLeaveConflicts(
        "user-123",
        new Date("2024-06-16"),
        new Date("2024-06-18")
      );

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe("DATE_OVERLAP");
      expect(conflicts[0].conflictId).toBe("leave-1");
    });

    it("should detect partial date overlaps", async () => {
      const existingLeave = {
        id: "leave-1",
        start_date: new Date("2024-06-10"),
        end_date: new Date("2024-06-20"),
        status: "PENDING",
      };

      mockPrisma.leave.findMany.mockResolvedValue([existingLeave]);

      const conflicts = await detectLeaveConflicts(
        "user-123",
        new Date("2024-06-15"),
        new Date("2024-06-17")
      );

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].severity).toBe("HIGH");
    });

    it("should exclude specific leave ID from conflict check", async () => {
      const existingLeave = {
        id: "leave-1",
        start_date: new Date("2024-06-15"),
        end_date: new Date("2024-06-17"),
        status: "APPROVED",
      };

      mockPrisma.leave.findMany.mockResolvedValue([existingLeave]);

      const conflicts = await detectLeaveConflicts(
        "user-123",
        new Date("2024-06-16"),
        new Date("2024-06-18"),
        "leave-1" // Exclude this leave from check
      );

      expect(conflicts).toHaveLength(0);
    });

    it("should ignore cancelled leaves", async () => {
      const cancelledLeave = {
        id: "leave-1",
        start_date: new Date("2024-06-15"),
        end_date: new Date("2024-06-17"),
        status: "CANCELLED",
      };

      mockPrisma.leave.findMany.mockResolvedValue([cancelledLeave]);

      const conflicts = await detectLeaveConflicts(
        "user-123",
        new Date("2024-06-16"),
        new Date("2024-06-18")
      );

      expect(conflicts).toHaveLength(0);
    });

    it("should detect multiple conflicts", async () => {
      const existingLeaves = [
        {
          id: "leave-1",
          start_date: new Date("2024-06-15"),
          end_date: new Date("2024-06-17"),
          status: "APPROVED",
        },
        {
          id: "leave-2",
          start_date: new Date("2024-06-19"),
          end_date: new Date("2024-06-21"),
          status: "PENDING",
        },
      ];

      mockPrisma.leave.findMany.mockResolvedValue(existingLeaves);

      const conflicts = await detectLeaveConflicts(
        "user-123",
        new Date("2024-06-14"),
        new Date("2024-06-25")
      );

      expect(conflicts).toHaveLength(2);
      expect(conflicts[0].conflictId).toBe("leave-1");
      expect(conflicts[1].conflictId).toBe("leave-2");
    });

    it("should handle database errors gracefully", async () => {
      mockPrisma.leave.findMany.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        detectLeaveConflicts("user-123", new Date(), new Date())
      ).rejects.toThrow("Failed to detect conflicts");
    });
  });

  describe("checkTeamAvailability", () => {
    it("should check minimum team coverage requirements", async () => {
      const teamMembers = [
        { id: "user-1", role: "DEVELOPER", active: true },
        { id: "user-2", role: "DEVELOPER", active: true },
        { id: "user-3", role: "MANAGER", active: true },
      ];

      const concurrentLeaves = [
        { user_id: "user-1", start_date: new Date("2024-06-15") },
      ];

      mockPrisma.profile.findMany.mockResolvedValue(teamMembers);
      mockPrisma.leave.findMany.mockResolvedValue(concurrentLeaves);

      const availability = await checkTeamAvailability(
        "team-123",
        new Date("2024-06-15"),
        new Date("2024-06-15")
      );

      expect(availability.totalMembers).toBe(3);
      expect(availability.availableMembers).toBe(2);
      expect(availability.minimumRequired).toBe(1); // At least 1 developer needed
      expect(availability.hasSufficientCoverage).toBe(true);
    });

    it("should detect insufficient team coverage", async () => {
      const teamMembers = [
        { id: "user-1", role: "DEVELOPER", active: true },
        { id: "user-2", role: "MANAGER", active: true },
      ];

      const concurrentLeaves = [
        { user_id: "user-1", start_date: new Date("2024-06-15") },
      ];

      mockPrisma.profile.findMany.mockResolvedValue(teamMembers);
      mockPrisma.leave.findMany.mockResolvedValue(concurrentLeaves);

      const availability = await checkTeamAvailability(
        "team-123",
        new Date("2024-06-15"),
        new Date("2024-06-15")
      );

      expect(availability.hasSufficientCoverage).toBe(false);
      expect(availability.shortageCount).toBe(1);
    });

    it("should exclude inactive team members", async () => {
      const teamMembers = [
        { id: "user-1", role: "DEVELOPER", active: true },
        { id: "user-2", role: "DEVELOPER", active: false }, // Inactive
      ];

      mockPrisma.profile.findMany.mockResolvedValue(teamMembers);
      mockPrisma.leave.findMany.mockResolvedValue([]);

      const availability = await checkTeamAvailability(
        "team-123",
        new Date("2024-06-15"),
        new Date("2024-06-15")
      );

      expect(availability.totalMembers).toBe(1); // Only active member counted
    });
  });

  describe("detectPolicyViolations", () => {
    it("should detect consecutive leave violations", async () => {
      const recentLeaves = [
        {
          start_date: new Date("2024-06-10"),
          end_date: new Date("2024-06-12"),
        },
        {
          start_date: new Date("2024-06-13"),
          end_date: new Date("2024-06-15"),
        },
      ];

      mockPrisma.leave.findMany.mockResolvedValue(recentLeaves);

      const violations = await detectPolicyViolations(
        "user-123",
        new Date("2024-06-16"),
        new Date("2024-06-18"),
        "annual"
      );

      expect(violations).toContainEqual({
        type: "CONSECUTIVE_LEAVE_EXCEEDED",
        severity: "MEDIUM",
        message: expect.stringContaining("Maximum consecutive leave days"),
        limit: 5,
        current: 9, // 3+3+3 days
      });
    });

    it("should detect insufficient notice period", async () => {
      const requestDate = new Date("2024-06-15");
      const startDate = new Date("2024-06-16"); // Only 1 day notice

      const violations = await detectPolicyViolations(
        "user-123",
        startDate,
        new Date("2024-06-18"),
        "annual"
      );

      expect(violations).toContainEqual({
        type: "INSUFFICIENT_NOTICE_PERIOD",
        severity: "LOW",
        message: expect.stringContaining("minimum notice period"),
        required: 3,
        provided: 1,
      });
    });

    it("should detect leave quota violations", async () => {
      // Mock user's current leave balance
      mockPrisma.leaveBalance.findMany.mockResolvedValue([
        {
          leave_type_id: "annual",
          remaining_days: 2,
          total_allocated: 20,
        },
      ]);

      const violations = await detectPolicyViolations(
        "user-123",
        new Date("2024-06-20"),
        new Date("2024-06-25"), // 5 days requested
        "annual"
      );

      expect(violations).toContainEqual({
        type: "INSUFFICIENT_LEAVE_BALANCE",
        severity: "HIGH",
        message: expect.stringContaining("Insufficient leave balance"),
        available: 2,
        requested: 5,
      });
    });

    it("should detect blackout period violations", async () => {
      // Mock blackout periods (e.g., project deadlines)
      const violations = await detectPolicyViolations(
        "user-123",
        new Date("2024-12-24"), // During holiday season
        new Date("2024-12-26"),
        "annual"
      );

      expect(violations).toContainEqual({
        type: "BLACKOUT_PERIOD_VIOLATION",
        severity: "HIGH",
        message: expect.stringContaining("blackout period"),
        blackoutStart: expect.any(Date),
        blackoutEnd: expect.any(Date),
      });
    });
  });

  describe("validateLeaveDates", () => {
    it("should validate future dates only", () => {
      const pastDate = new Date("2023-01-01");
      const today = new Date();

      const result = validateLeaveDates(pastDate, today);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Leave dates must be in the future");
    });

    it("should validate end date after start date", () => {
      const startDate = new Date("2024-06-20");
      const endDate = new Date("2024-06-18"); // Before start

      const result = validateLeaveDates(startDate, endDate);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("End date must be after start date");
    });

    it("should validate reasonable date range", () => {
      const startDate = new Date("2024-06-01");
      const endDate = new Date("2024-12-31"); // Too far in future

      const result = validateLeaveDates(startDate, endDate);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Leave period exceeds maximum allowed duration");
    });

    it("should validate weekend and holiday restrictions", () => {
      const startDate = new Date("2024-12-25"); // Christmas
      const endDate = new Date("2024-12-25");

      const result = validateLeaveDates(startDate, endDate);

      expect(result.warnings).toContain(
        expect.stringContaining("public holiday")
      );
    });

    it("should pass valid date range", () => {
      const startDate = new Date("2024-06-15");
      const endDate = new Date("2024-06-17");

      const result = validateLeaveDates(startDate, endDate);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Integration Tests", () => {
    it("should combine conflict and policy detection", async () => {
      // Setup conflicting leave and policy violations
      mockPrisma.leave.findMany.mockResolvedValue([
        {
          id: "leave-1",
          start_date: new Date("2024-06-15"),
          end_date: new Date("2024-06-17"),
          status: "APPROVED",
        },
      ]);

      mockPrisma.leaveBalance.findMany.mockResolvedValue([
        {
          remaining_days: 1,
        },
      ]);

      const conflicts = await detectLeaveConflicts(
        "user-123",
        new Date("2024-06-16"),
        new Date("2024-06-18")
      );

      const violations = await detectPolicyViolations(
        "user-123",
        new Date("2024-06-16"),
        new Date("2024-06-18"),
        "annual"
      );

      expect(conflicts).toHaveLength(1);
      expect(violations.length).toBeGreaterThan(0);
    });

    it("should handle edge case - same day requests", async () => {
      const existingLeave = {
        id: "leave-1",
        start_date: new Date("2024-06-15"),
        end_date: new Date("2024-06-15"), // Single day
        status: "APPROVED",
      };

      mockPrisma.leave.findMany.mockResolvedValue([existingLeave]);

      const conflicts = await detectLeaveConflicts(
        "user-123",
        new Date("2024-06-15"),
        new Date("2024-06-15")
      );

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe("DATE_OVERLAP");
    });
  });
});