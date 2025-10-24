/**
 * Leave Approval API
 * T-013: Approve leave requests
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leaveApprovalSchema } from "@/lib/validations/leave";
import { auditLeaveApproved } from "@/lib/services/audit";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
  { params }: { params: { id: string } }
    
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");
  try {
    // Authenticate user
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has manager/admin/HR role
    const profile = await prisma.profile.findUnique({
      where: { user_id: user.id },
    });

    if (!profile || !["MANAGER", "ADMIN", "HR"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validation = leaveApprovalSchema.safeParse(body);

    if (!validation.success) {
      const flattened = validation.error.flatten();
      return NextResponse.json(
        {
          error: "Validation failed",
          details: {
            fieldErrors: flattened.fieldErrors,
            formErrors: flattened.formErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const leaveId = params.id;

    // Get leave request
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      include: {
        leave_type: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!leave) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    // Check if leave is pending
    if (leave.status !== "PENDING") {
      return NextResponse.json(
        { error: `Cannot approve leave with status: ${leave.status}` },
        { status: 400 }
      );
    }

    // Update leave status
    const updatedLeave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: "APPROVED",
        approved_by: user.id,
        approved_at: new Date(),
        manager_comment: data.manager_comment || null,
      },
      include: {
        leave_type: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Create notification for employee
    await prisma.notificationLog.create({
      data: {
        user_id: leave.user_id,
        type: "LEAVE_APPROVED",
        title: "Leave Request Approved",
        message: `Your ${leave.leave_type.name} request from ${leave.start_date.toISOString().split("T")[0]} to ${leave.end_date.toISOString().split("T")[0]} has been approved`,
        link: `/employee/leaves/${leaveId}`,
        read: false,
      },
    });

    // Create comprehensive audit log
    await auditLeaveApproved(user.id, leaveId, {
      employeeId: leave.user_id,
      employeeName: leave.user.profile?.full_name,
      leaveType: leave.leave_type.name,
      startDate: leave.start_date,
      endDate: leave.end_date,
      daysCount: leave.days_count,
      managerComment: data.manager_comment,
    });

    return NextResponse.json({
      message: "Leave approved successfully",
      leave: updatedLeave,
    });
  } catch (error) {
    console.error("Error approving leave:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
