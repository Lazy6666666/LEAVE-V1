import { createClient } from "@/lib/supabase/server";
import { DatabaseMonitoringService } from "@/lib/services/database-monitoring";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Verify user has admin privileges
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "ADMIN" && profile?.role !== "HR") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const monitoringService = new DatabaseMonitoringService();
    const metrics = await monitoringService.getPerformanceMetrics();

    return NextResponse.json({ data: metrics });
  } catch (error) {
    console.error("Database metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch database metrics" },
      { status: 500 }
    );
  }
}
