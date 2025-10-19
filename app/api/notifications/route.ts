/**
 * Notifications API Route
 * T-036: Notification System Enhancement
 * GET /api/notifications - Fetch user's notifications
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = searchParams.get("type");

    // Build where clause
    const where: any = {
      user_id: user.id,
    };

    if (unreadOnly) {
      where.read = false;
    }

    if (type) {
      where.type = type;
    }

    // Fetch notifications
    const notifications = await prisma.notificationLog.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Get total count
    const total = await prisma.notificationLog.count({ where });

    // Get unread count
    const unreadCount = await prisma.notificationLog.count({
      where: {
        user_id: user.id,
        read: false,
      },
    });

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
