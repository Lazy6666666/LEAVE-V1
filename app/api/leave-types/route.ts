/**
 * Leave Types API
 * Get all active leave types
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
/**
 * GET /api/leave-types - Get all active leave types
 */
// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET() {
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

    // Fetch all active leave types
    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        annual_quota: true,
        requires_approval: true,
      },
    });

    return NextResponse.json({
      leave_types: leaveTypes,
      total: leaveTypes.length,
    });
  } catch (error) {
    console.error("Error fetching leave types:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
