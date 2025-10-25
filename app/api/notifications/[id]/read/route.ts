/**
 * Mark Notification as Read API Route
 * T-036: Notification System Enhancement
 * PATCH /api/notifications/[id]/read - Mark single notification as read
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function PATCH(
  _request: NextRequest,
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

    const notificationId = params.id;

    // Verify notification belongs to user
    const existingNotification = await prisma.notificationLog.findUnique({
      where: { id: notificationId },
    });

    if (!existingNotification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (existingNotification.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark as read
    const notification = await prisma.notificationLog.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return NextResponse.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
