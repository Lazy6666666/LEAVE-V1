/**
 * Test Notification API Route
 * T-036: Notification System Enhancement
 * Development-only endpoint for testing notifications
 *
 * SECURITY NOTE: Remove this endpoint in production or add proper admin-only checks
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/services/notification";

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

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, message" },
        { status: 400 }
      );
    }

    // Create the notification
    await createNotification({
      userId: user.id,
      type: body.type,
      title: body.title,
      message: body.message,
      link: body.link || null,
    });

    return NextResponse.json({
      success: true,
      message: "Test notification created successfully",
    });
  } catch (error) {
    console.error("Error creating test notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
