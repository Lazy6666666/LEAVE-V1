/**
 * Mark All Notifications as Read API Route
 * T-036: Notification System Enhancement
 * POST /api/notifications/read-all - Mark all user's notifications as read
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(_request: NextRequest) {
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

    // Mark all user's notifications as read
    const result = await prisma.notificationLog.updateMany({
      where: {
        user_id: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      message: "All notifications marked as read",
      count: result.count,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
