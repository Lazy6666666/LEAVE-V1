/**
 * Leave Cancellation API
 * T-015: Cancel leave requests
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leaveCancellationSchema } from "@/lib/validations/leave";

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

    // Parse request body
    const body = await request.json();
    const validation = leaveCancellationSchema.safeParse(body);

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

    // Check if user owns this leave request
    if (leave.user_id !== user.id) {
      return NextResponse.json(
        { error: "You can only cancel your own leave requests" },
        { status: 403 }
      );
    }

    // Check if leave can be cancelled (only PENDING or future APPROVED leaves)
    if (leave.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Leave request is already cancelled" },
        { status: 400 }
      );
    }

    if (leave.status === "REJECTED") {
      return NextResponse.json(
        { error: "Cannot cancel a rejected leave request" },
        { status: 400 }
      );
    }

    // Check if leave has already started
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (leave.start_date < today) {
      return NextResponse.json(
        { error: "Cannot cancel a leave that has already started" },
        { status: 400 }
      );
    }

    // Update leave status to CANCELLED
    const updatedLeave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: "CANCELLED",
        manager_comment: data.cancellation_reason
          ? `Cancelled by employee: ${data.cancellation_reason}`
          : "Cancelled by employee",
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

    // Create notification for user
    await prisma.notificationLog.create({
      data: {
        user_id: user.id,
        type: "LEAVE_CANCELLED",
        title: "Leave Request Cancelled",
        message: `Your ${leave.leave_type.name} request from ${leave.start_date.toISOString().split("T")[0]} to ${leave.end_date.toISOString().split("T")[0]} has been cancelled`,
        link: `/employee/leaves/${leaveId}`,
        read: false,
      },
    });

    // If leave was approved, notify manager
    if (leave.status === "APPROVED" && leave.approved_by) {
      await prisma.notificationLog.create({
        data: {
          user_id: leave.approved_by,
          type: "LEAVE_CANCELLED",
          title: "Approved Leave Cancelled",
          message: `${leave.user.profile?.full_name} cancelled their approved ${leave.leave_type.name} request`,
          link: `/manager/approvals`,
          read: false,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: "LEAVE_CANCELLED",
        entity_type: "LEAVE",
        entity_id: leaveId,
        old_values: JSON.stringify({
          status: leave.status,
        }),
        new_values: JSON.stringify({
          status: "CANCELLED",
          cancellation_reason: data.cancellation_reason,
        }),
      },
    });

    return NextResponse.json({
      message: "Leave cancelled successfully",
      leave: updatedLeave,
    });
  } catch (error) {
    console.error("Error cancelling leave:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
