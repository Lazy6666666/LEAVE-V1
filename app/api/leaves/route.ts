/**
 * Leave Management API Routes
 * Refactored with clean architecture and separation of concerns
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSuccessResponse, createErrorResponse, APIErrors, withAPIMiddleware } from "@/lib/api";
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
async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw APIErrors.unauthorized();
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryOptions = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      userId: searchParams.get('userId') || undefined,
      status: searchParams.get('status') as any || undefined,
      leaveTypeId: searchParams.get('leaveTypeId') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      includeUser: searchParams.get('includeUser') === 'true',
      includeLeaveType: searchParams.get('includeLeaveType') === 'true',
    };

    // Validate query options
    const validation = leaveQuerySchema.safeParse(queryOptions);
    if (!validation.success) {
      throw APIErrors.validationError('Invalid query parameters', validation.error.flatten());
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
        page: queryOptions.offset && queryOptions.limit
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
async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw APIErrors.unauthorized();
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = leaveRequestSchema.safeParse(body);

    if (!validation.success) {
      throw APIErrors.validationError('Validation failed', validation.error.flatten());
    }

    const leaveData = validation.data;

    // Set the user ID from authenticated user
    leaveData.userId = user.id;

    // Validate leave request
    const validationResult = await validateLeaveRequest(leaveData);
    if (!validationResult.isValid) {
      throw APIErrors.validationError(validationResult.error || 'Validation failed');
    }

    // Check for overlapping leaves
    const overlappingLeaves = await checkOverlappingLeaves(
      leaveData.userId,
      new Date(leaveData.startDate),
      new Date(leaveData.endDate)
    );

    if (overlappingLeaves.length > 0) {
      throw APIErrors.leaveConflict('Leave dates conflict with existing leave requests');
    }

    // Calculate working days
    const workingDays = calculateWorkingDays(
      new Date(leaveData.startDate),
      new Date(leaveData.endDate)
    );

    // Create the leave request
    const leave = await leaveRepository.create({
      ...leaveData,
      startDate: new Date(leaveData.startDate),
      endDate: new Date(leaveData.endDate),
    });

    // Update leave balance
    await leaveRepository.updateBalance(
      leave.userId,
      leave.leaveTypeId,
      new Date().getFullYear(),
      workingDays
    );

    // TODO: Send notification to manager
    // await notificationService.notifyManager(leave);

    return createSuccessResponse(leave, {
      message: 'Leave request created successfully',
    });
  } catch (error) {
    throw error;
  }
}

// Apply middleware to handlers
export const GET = withAPIMiddleware(GET);
export const POST = withAPIMiddleware(POST);