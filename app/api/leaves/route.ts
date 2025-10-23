/**
 * Leave Management API Routes
 * Refactored with clean architecture and separation of concerns
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSuccessResponse, APIErrors, withAPIMiddleware } from "@/lib/api";
import { LeaveRepository } from "@/lib/repositories/leave-repository";
import { leaveRequestSchema, leaveQuerySchema } from "@/lib/validations/leave";
import {
  validateLeaveRequest,
  checkOverlappingLeaves,
  calculateWorkingDays,
} from "@/lib/services/leave-balance";

// Initialize repository
const leaveRepository = new LeaveRepository();

/**
 * GET /api/leaves - List leaves with filtering
 */
async function getLeaves(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw APIErrors.unauthorized();
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryOptions = {
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : undefined,
      userId: searchParams.get("userId") || undefined,
      status: searchParams.get("status") as
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "CANCELLED"
        | undefined,
      leaveTypeId: searchParams.get("leaveTypeId") || undefined,
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      includeUser: searchParams.get("includeUser") === "true",
      includeLeaveType: searchParams.get("includeLeaveType") === "true",
    };

    // Validate query options
    const validation = leaveQuerySchema.safeParse(queryOptions);
    if (!validation.success) {
      throw APIErrors.validationError(
        "Invalid query parameters",
        validation.error.flatten()
      );
    }

    // Check permissions - users can only see their own leaves unless they're managers/admins
    if (queryOptions.userId && queryOptions.userId !== user.id) {
      // TODO: Check if user is manager/admin
      // For now, only allow users to see their own leaves
      queryOptions.userId = user.id;
    } else if (!queryOptions.userId) {
      queryOptions.userId = user.id;
    }

    // Fetch leaves
    const [leaves, total] = await Promise.all([
      leaveRepository.findMany(queryOptions),
      leaveRepository.count(queryOptions),
    ]);

    return createSuccessResponse(leaves, {
      pagination: {
        total,
        limit: queryOptions.limit,
        page:
          queryOptions.offset && queryOptions.limit
            ? Math.floor(queryOptions.offset / queryOptions.limit) + 1
            : 1,
        totalPages: queryOptions.limit
          ? Math.ceil(total / queryOptions.limit)
          : 1,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * POST /api/leaves - Create new leave request
 */
async function createLeave(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw APIErrors.unauthorized();
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = leaveRequestSchema.safeParse(body);

    if (!validation.success) {
      throw APIErrors.validationError(
        "Validation failed",
        validation.error.flatten()
      );
    }

    const leaveData = validation.data;

    // Set the user ID from authenticated user - Note: database uses user_id
    // We'll keep the validation data as-is since it matches the database schema

    // Validate leave request
    const validationResult = await validateLeaveRequest(
      user.id,
      leaveData.leave_type_id,
      leaveData.days_count
    );
    if (!validationResult.isValid) {
      throw APIErrors.validationError(
        validationResult.message || "Validation failed"
      );
    }

    // Check for overlapping leaves
    const hasOverlappingLeaves = await checkOverlappingLeaves(
      user.id,
      new Date(leaveData.start_date),
      new Date(leaveData.end_date)
    );

    if (hasOverlappingLeaves) {
      throw APIErrors.leaveConflict(
        "Leave dates conflict with existing leave requests"
      );
    }

    // Calculate working days
    const workingDays = calculateWorkingDays(
      new Date(leaveData.start_date),
      new Date(leaveData.end_date)
    );

    // Create the leave request
    const leave = await leaveRepository.create({
      userId: user.id,
      leaveTypeId: leaveData.leave_type_id,
      startDate: new Date(leaveData.start_date),
      endDate: new Date(leaveData.end_date),
      reason: leaveData.reason || "",
    });

    // Update leave balance
    await leaveRepository.updateBalance(
      leave.user_id,
      leave.leave_type_id,
      new Date().getFullYear(),
      workingDays
    );

    // TODO: Send notification to manager
    // await notificationService.notifyManager(leave);

    return createSuccessResponse(leave);
  } catch (error) {
    throw error;
  }
}

// Apply middleware to handlers
export const GET = withAPIMiddleware(getLeaves);
export const POST = withAPIMiddleware(createLeave);
