// Calendar API - Fetch calendar events with filters

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCalendarEvents } from "@/lib/services/calendar";
import { CalendarFilters } from "@/types/calendar";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const userIds = searchParams.get("userIds")?.split(",").filter(Boolean);
    const leaveTypeIds = searchParams
      .get("leaveTypeIds")
      ?.split(",")
      .filter(Boolean);
    const departments = searchParams
      .get("departments")
      ?.split(",")
      .filter(Boolean);

    // Build filters
    const filters: CalendarFilters = {};

    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (userIds && userIds.length > 0) filters.userIds = userIds;
    if (leaveTypeIds && leaveTypeIds.length > 0)
      filters.leaveTypeIds = leaveTypeIds;
    if (departments && departments.length > 0)
      filters.departments = departments;

    // Fetch calendar events
    const events = await getCalendarEvents(filters);

    // Return response
    return NextResponse.json({
      events,
      meta: {
        total: events.length,
        dateRange: {
          start: startDate || new Date().toISOString().split("T")[0],
          end:
            endDate ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
        },
      },
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
