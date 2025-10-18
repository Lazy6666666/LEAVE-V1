// Conflict detection service for leave requests

import prisma from "@/lib/prisma";
import { ConflictDetection, ConflictDetail } from "@/types/calendar";

/**
 * Detect conflicts for a leave request
 */
export async function detectConflicts(
  userId: string,
  _leaveTypeId: string, // Prefixed with underscore to indicate intentionally unused
  startDate: string,
  endDate: string,
  department?: string
): Promise<ConflictDetection> {
  // Get conflict threshold from settings (default: 2)
  const threshold = await getConflictThreshold();

  // Get user's department if not provided
  if (!department) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: {
            department: true,
          },
        },
      },
    });
    department = user?.profile?.department || undefined;
  }

  // Find overlapping leaves
  const overlappingLeaves = await prisma.leave.findMany({
    where: {
      status: { in: ["APPROVED", "PENDING"] },
      user_id: { not: userId }, // Exclude the requester
      ...(department && {
        user: {
          profile: {
            department,
          },
        },
      }),
      AND: [
        { start_date: { lte: new Date(endDate) } },
        { end_date: { gte: new Date(startDate) } },
      ],
    },
    include: {
      user: {
        include: {
          profile: {
            select: {
              full_name: true,
            },
          },
        },
      },
      leave_type: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      start_date: "asc",
    },
  });

  // Calculate conflict details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conflicts: ConflictDetail[] = overlappingLeaves.map((leave: any) => {
    const overlapStart = new Date(
      Math.max(
        new Date(startDate).getTime(),
        new Date(leave.start_date).getTime()
      )
    );
    const overlapEnd = new Date(
      Math.min(new Date(endDate).getTime(), new Date(leave.end_date).getTime())
    );
    const overlapDays =
      Math.ceil(
        (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    return {
      userId: leave.user_id,
      userName: leave.user?.profile?.full_name || "Unknown",
      leaveType: leave.leave_type?.name || "Unknown",
      startDate: leave.start_date.toISOString().split("T")[0],
      endDate: leave.end_date.toISOString().split("T")[0],
      overlapDays,
    };
  });

  const conflictCount = overlappingLeaves.length;
  const hasConflict = conflictCount >= threshold;

  // Determine severity
  const severity: "warning" | "blocking" =
    conflictCount > threshold + 1 ? "blocking" : "warning";

  // Generate message
  const message = hasConflict
    ? `${conflictCount} team members already have ${conflictCount > 1 ? "approved/pending" : "an approved/pending"} leave during this period (threshold: ${threshold})`
    : "No conflicts detected";

  return {
    hasConflict,
    severity,
    threshold,
    conflictCount,
    conflicts,
    message,
    canOverride: severity === "warning", // Only warnings can be overridden
  };
}

/**
 * Get conflict threshold from company settings
 */
export async function getConflictThreshold(): Promise<number> {
  try {
    const setting = await prisma.companySettings.findUnique({
      where: { key: "conflict_threshold" },
    });

    if (
      setting &&
      typeof setting.value === "object" &&
      setting.value !== null
    ) {
      const value = setting.value as { value?: number };
      return value.value || 2;
    }

    return 2; // Default threshold
  } catch (error) {
    console.error("Error fetching conflict threshold:", error);
    return 2;
  }
}

/**
 * Format conflict warning for display
 */
export function formatConflictWarning(conflicts: ConflictDetail[]): string {
  if (conflicts.length === 0) return "No conflicts";

  if (conflicts.length === 1) {
    const c = conflicts[0];
    return `${c.userName} has ${c.leaveType} from ${c.startDate} to ${c.endDate}`;
  }

  return `${conflicts.length} team members have conflicting leave requests`;
}
