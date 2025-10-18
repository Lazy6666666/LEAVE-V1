// Conflict Check API - Check for leave conflicts before submission/approval

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectConflicts } from "@/lib/services/conflict-detection";
import { z } from "zod";

const conflictCheckSchema = z.object({
  userId: z.string().uuid(),
  leaveTypeId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),
  department: z.string().optional(),
});

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

    // Parse and validate request body
    const body = await request.json();
    const validation = conflictCheckSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { userId, leaveTypeId, startDate, endDate, department } =
      validation.data;

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { error: "Start date must be before or equal to end date" },
        { status: 400 }
      );
    }

    // Detect conflicts
    const conflictResult = await detectConflicts(
      userId,
      leaveTypeId,
      startDate,
      endDate,
      department
    );

    return NextResponse.json(conflictResult);
  } catch (error) {
    console.error("Conflict check API error:", error);
    return NextResponse.json(
      { error: "Failed to check for conflicts" },
      { status: 500 }
    );
  }
}
