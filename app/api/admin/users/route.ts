import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["EMPLOYEE", "MANAGER", "HR", "ADMIN"]),
  department: z.string().min(1, "Department is required"),
  employeeId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const department = searchParams.get("department");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

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

    if (!profile || !["ADMIN", "HR"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Build query
    let query = supabase.from("profiles").select(`
        *,
        leave_balances (
          annual_leave,
          sick_leave,
          personal_leave,
          maternity_leave
        )
      `);

    // Apply filters
    if (role && role !== "all") {
      query = query.eq("role", role);
    }
    if (department && department !== "all") {
      query = query.eq("department", department);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,department.ilike.%${search}%`
      );
    }

    const { data: users, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error in users API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Validate request body
    const validatedData = createUserSchema.parse(body);

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

    if (!profile || !["ADMIN", "HR"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", validatedData.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Create user in auth system
    const { data: authData, error: createError } =
      await supabase.auth.admin.createUser({
        email: validatedData.email,
        email_confirm: true,
        user_metadata: {
          name: validatedData.name,
          role: validatedData.role,
          department: validatedData.department,
        },
      });

    if (createError) {
      console.error("Error creating auth user:", createError);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        department: validatedData.department,
        employee_id: validatedData.employeeId,
        status: "ACTIVE",
        join_date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Rollback auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Initialize leave balances
    const { error: balanceError } = await supabase
      .from("leave_balances")
      .insert({
        user_id: authData.user.id,
        annual_leave: 21,
        sick_leave: 10,
        personal_leave: 5,
        maternity_leave: 90,
      });

    if (balanceError) {
      console.error("Error creating leave balances:", balanceError);
      // Non-critical error, don't rollback
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "CREATE_USER",
      target_user_id: authData.user.id,
      details: {
        created_user_email: validatedData.email,
        created_user_role: validatedData.role,
        created_user_department: validatedData.department,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: profileData,
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

    console.error("Error in users API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
