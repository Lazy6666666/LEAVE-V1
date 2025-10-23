/**
 * Notifications API Route
 * T-036: Notification System Enhancement
 * GET /api/notifications - Fetch user's notifications
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@/lib/types/notification";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createClient();
    const authResult = await supabase.auth.getUser();

    // Handle the case where authResult is undefined or doesn't have expected structure
    if (!authResult || authResult.error || !authResult.data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult.data;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = searchParams.get("type");

    // Build where clause
    const where: {
      user_id: string;
      read?: boolean;
      type?: NotificationType;
    } = {
      user_id: user.id,
    };

    if (unreadOnly) {
      where.read = false;
    }

    if (type) {
      where.type = type as NotificationType;
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
