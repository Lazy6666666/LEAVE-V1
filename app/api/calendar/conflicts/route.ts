// Calendar Conflict Detection API - Check for leave conflicts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import {
  ConflictDetection,
  ConflictCheckRequest,
  ConflictDetail,
} from "@/types/calendar";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: ConflictCheckRequest = await request.json();
    const { userId, leaveTypeId, startDate, endDate, department } = body;

    if (!userId || !leaveTypeId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get leave type details
    const leaveType = await prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
      select: { name: true, requires_approval: true },
    });

    if (!leaveType) {
      return NextResponse.json(
        { error: "Invalid leave type" },
        { status: 400 }
      );
    }

    // Check for overlapping leaves in the same department
    const conflictingLeaves = await prisma.leave.findMany({
      where: {
        status: "APPROVED",
        user_id: { not: userId }, // Exclude user's own leaves
        start_date: { lte: new Date(endDate) },
        end_date: { gte: new Date(startDate) },
        user: {
          profile: department
            ? {
                department: department,
              }
            : undefined,
        },
      },
      include: {
        user: {
          include: {
            profile: {
              select: {
                full_name: true,
                department: true,
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
    });

    // Calculate conflict details
    const conflicts: ConflictDetail[] = [];
    for (const leave of conflictingLeaves) {
      const overlapStart = new Date(
        Math.max(
          new Date(startDate).getTime(),
          new Date(leave.start_date).getTime()
        )
      );
      const overlapEnd = new Date(
        Math.min(
          new Date(endDate).getTime(),
          new Date(leave.end_date).getTime()
        )
      );

      const overlapDays =
        Math.ceil(
          (overlapEnd.getTime() - overlapStart.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      if (overlapDays > 0) {
        conflicts.push({
          userId: leave.user_id,
          userName: leave.user?.profile?.full_name || "Unknown User",
          leaveType: leave.leave_type?.name || "Unknown",
          startDate: leave.start_date.toISOString().split("T")[0],
          endDate: leave.end_date.toISOString().split("T")[0],
          overlapDays,
        });
      }
    }

    // Determine conflict severity based on team size and conflicts
    const departmentSize = department
      ? await prisma.profile.count({
          where: { department },
        })
      : 1;

    const conflictThreshold = Math.max(1, Math.floor(departmentSize * 0.3)); // 30% of team
    const hasConflict = conflicts.length > 0;

    let severity: "warning" | "blocking" = "warning";
    let canOverride = true;
    let message = "";

    if (conflicts.length >= conflictThreshold) {
      severity = "blocking";
      canOverride = false;
      message = `High conflict detected: ${conflicts.length} team members have overlapping leave. Consider alternative dates.`;
    } else if (conflicts.length > 0) {
      severity = "warning";
      message = `Low conflict detected: ${conflicts.length} team member(s) have overlapping leave.`;
    } else {
      message = "No conflicts detected. Your leave request can proceed.";
    }

    const conflictDetection: ConflictDetection = {
      hasConflict,
      severity,
      threshold: conflictThreshold,
      conflictCount: conflicts.length,
      conflicts,
      message,
      canOverride,
    };

    return NextResponse.json(conflictDetection);
  } catch (error) {
    console.error("Conflict detection API error:", error);
    return NextResponse.json(
      { error: "Failed to check conflicts" },
      { status: 500 }
    );
  }
}
