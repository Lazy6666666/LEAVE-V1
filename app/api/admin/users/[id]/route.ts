import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["EMPLOYEE", "MANAGER", "HR", "ADMIN"]).optional(),
  department: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  employee_id: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

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

    // Get user details
    const { data: userData, error } = await supabase
      .from("profiles")
      .select(
        `
        *,
        leave_balances (
          annual_leave,
          sick_leave,
          personal_leave,
          maternity_leave
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Error in user API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateUserSchema.parse(body);

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

    // Prevent admin from modifying their own role to lower privilege
    if (
      id === user.id &&
      validatedData.role &&
      validatedData.role !== profile.role
    ) {
      return NextResponse.json(
        { error: "Cannot modify your own role" },
        { status: 400 }
      );
    }

    // Check if email is being changed and if it already exists
    if (validatedData.email) {
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", validatedData.email)
        .neq("id", id)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
    }

    // Update user profile
    const { data: updatedUser, error } = await supabase
      .from("profiles")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    // Update auth metadata if name or role changed
    if (validatedData.name || validatedData.role) {
      const { data: authUser } = await supabase.auth.admin.getUserById(id);
      if (authUser.user) {
        await supabase.auth.admin.updateUserById(id, {
          user_metadata: {
            ...authUser.user.user_metadata,
            ...(validatedData.name && { name: validatedData.name }),
            ...(validatedData.role && { role: validatedData.role }),
          },
        });
      }
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "UPDATE_USER",
      target_user_id: id,
      details: {
        updated_fields: Object.keys(validatedData),
        updated_values: validatedData,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
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

    console.error("Error in user API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

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

    // Prevent admin from deleting themselves
    if (id === user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Get user details before deletion for audit log
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("email, role")
      .eq("id", id)
      .single();

    // Delete user's profile and related data
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) {
      console.error("Error deleting user profile:", profileError);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    // Delete user from auth system
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(id);

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      // Non-critical error as profile is already deleted
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "DELETE_USER",
      target_user_id: id,
      details: {
        deleted_user_email: targetUser?.email,
        deleted_user_role: targetUser?.role,
      },
    });

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error in user API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
