/**
 * Leave Management API Routes
 * T-011: Leave Request Submission and Listing
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { leaveRequestSchema, leaveQuerySchema } from "@/lib/validations/leave";
import {
  validateLeaveRequest,
  checkOverlappingLeaves,
  calculateWorkingDays,
} from "@/lib/services/leave-balance";

/**
 * POST /api/leaves - Create new leave request
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = leaveRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    // Recalculate working days (server-side validation)
    const workingDays = calculateWorkingDays(startDate, endDate);

    // Check for overlapping leaves
    const hasOverlap = await checkOverlappingLeaves(
      user.id,
      startDate,
      endDate
    );

    if (hasOverlap) {
      return NextResponse.json(
        { error: "You have overlapping leave requests for these dates" },
        { status: 409 }
      );
    }

    // Validate leave balance
    const balanceValidation = await validateLeaveRequest(
      user.id,
      data.leave_type_id,
      workingDays,
      startDate.getFullYear()
    );

    if (!balanceValidation.isValid) {
      return NextResponse.json(
        {
          error: balanceValidation.message,
          availableBalance: balanceValidation.availableBalance,
        },
        { status: 400 }
      );
    }

    // Create leave request
    const leave = await prisma.leave.create({
      data: {
        user_id: user.id,
        leave_type_id: data.leave_type_id,
        start_date: startDate,
        end_date: endDate,
        days_count: workingDays,
        reason: data.reason || null,
        status: "PENDING",
      },
      include: {
        leave_type: true,
      },
    });

    // Create notification (to be implemented with notification system)
    await prisma.notificationLog.create({
      data: {
        user_id: user.id,
        type: "LEAVE_CREATED",
        title: "Leave Request Submitted",
        message: `Your leave request for ${workingDays} days has been submitted`,
        read: false,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: "LEAVE_CREATED",
        entity_type: "LEAVE",
        entity_id: leave.id,
        details: {
          leave_type: leave.leave_type.name,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          days_count: workingDays,
        },
      },
    });

    return NextResponse.json(
      {
        message: "Leave request created successfully",
        leave,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leaves - Get user's leave requests
 */
export async function GET(request: NextRequest) {
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

    // Get user's profile to check role
    const profile = await prisma.profile.findUnique({
      where: { user_id: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryValidation = leaveQuerySchema.safeParse({
      status: searchParams.get("status"),
      start_date: searchParams.get("start_date"),
      end_date: searchParams.get("end_date"),
      leave_type_id: searchParams.get("leave_type_id"),
      user_id: searchParams.get("user_id"),
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: queryValidation.error.errors,
        },
        { status: 400 }
      );
    }

    const query = queryValidation.data;

    // Build where clause based on role
    const where: any = {};

    // Employees can only see their own leaves
    // Managers can see team leaves (implement manager_id logic later)
    // HR and Admin can see all leaves
    if (profile.role === "EMPLOYEE") {
      where.user_id = user.id;
    } else if (profile.role === "MANAGER") {
      // For now, managers see all (TODO: implement team filtering)
      // where.user_id = { in: teamMemberIds };
    }
    // HR and ADMIN see all

    // Apply filters
    if (query.status) {
      where.status = query.status;
    }

    if (query.leave_type_id) {
      where.leave_type_id = query.leave_type_id;
    }

    if (query.user_id && ["HR", "ADMIN", "MANAGER"].includes(profile.role)) {
      where.user_id = query.user_id;
    }

    if (query.start_date) {
      where.start_date = { gte: new Date(query.start_date) };
    }

    if (query.end_date) {
      where.end_date = { lte: new Date(query.end_date) };
    }

    // Fetch leaves with optimized select
    const leaves = await prisma.leave.findMany({
      where,
      include: {
        leave_type: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                full_name: true,
                avatar_url: true,
                department: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: query.limit,
      skip: query.offset,
    });

    // Get total count
    const total = await prisma.leave.count({ where });

    return NextResponse.json({
      leaves,
      total,
      limit: query.limit,
      offset: query.offset,
    });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
