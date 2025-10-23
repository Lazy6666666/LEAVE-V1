import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const settingsSchema = z.object({
  company_name: z.string().optional(),
  company_email: z.string().email().optional(),
  support_phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional(),
  timezone: z.string().optional(),
  date_format: z.string().optional(),
  language: z.string().optional(),
  working_days: z.array(z.string()).optional(),
  working_hours: z.string().optional(),
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  sms_notifications: z.boolean().optional(),
  slack_notifications: z.boolean().optional(),
  password_min_length: z.number().optional(),
  password_require_uppercase: z.boolean().optional(),
  password_require_lowercase: z.boolean().optional(),
  password_require_numbers: z.boolean().optional(),
  password_require_symbols: z.boolean().optional(),
  session_timeout: z.number().optional(),
  max_login_attempts: z.number().optional(),
  lockout_duration: z.number().optional(),
  two_factor_auth: z.boolean().optional(),
  auto_backup: z.boolean().optional(),
  backup_frequency: z.string().optional(),
  backup_retention: z.number().optional(),
  data_retention_period: z.number().optional(),
  max_file_size: z.number().optional(),
  maintenance_mode: z.boolean().optional(),
  maintenance_message: z.string().optional(),
  api_rate_limit: z.number().optional(),
  cache_timeout: z.number().optional(),
});

export async function GET() {
  try {
    const supabase = createClient();

    // Check if user has admin privileges
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

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get system settings
    const { data: settings, error } = await supabase
      .from("system_settings")
      .select("*")
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error fetching settings:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    // Return default settings if none exist
    const defaultSettings = {
      company_name: "TechCorp Solutions",
      company_email: "hr@techcorp.com",
      support_phone: "+1-555-0123",
      address: "123 Business Ave, Tech City, TC 12345",
      website: "https://techcorp.com",
      timezone: "America/New_York",
      date_format: "MM/DD/YYYY",
      language: "English",
      working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      working_hours: "9:00 AM - 6:00 PM",
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      slack_notifications: true,
      password_min_length: 8,
      password_require_uppercase: true,
      password_require_lowercase: true,
      password_require_numbers: true,
      password_require_symbols: true,
      session_timeout: 30,
      max_login_attempts: 5,
      lockout_duration: 15,
      two_factor_auth: true,
      auto_backup: true,
      backup_frequency: "daily",
      backup_retention: 30,
      data_retention_period: 2555,
      max_file_size: 10,
      maintenance_mode: false,
      maintenance_message:
        "System is currently under maintenance. Please try again later.",
      api_rate_limit: 1000,
      cache_timeout: 3600,
    };

    return NextResponse.json({
      settings: settings || defaultSettings,
    });
  } catch (error) {
    console.error("Error in settings API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Validate request body
    const validatedData = settingsSchema.parse(body);

    // Check if user has admin privileges
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

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Update or insert settings
    const { data: settings, error } = await supabase
      .from("system_settings")
      .upsert({
        id: 1, // Single row for system settings
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error updating settings:", error);
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "UPDATE_SETTINGS",
      details: {
        updated_fields: Object.keys(validatedData),
        updated_values: validatedData,
      },
    });

    return NextResponse.json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const flattened = error.flatten();
      return NextResponse.json(
        {
          error: "Validation failed",
          details: {
            fieldErrors: flattened.fieldErrors,
            formErrors: flattened.formErrors,
          },
        },
        { status: 400 }
      );
    }

    console.error("Error in settings API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
