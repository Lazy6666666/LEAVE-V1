import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile
    const profile = await prisma.profile.findUnique({
      where: {
        user_id: user.id,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        profile: {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.user.email,
          department: profile.department,
          role: profile.role,
          avatar_url: profile.avatar_url,
          manager_id: profile.manager_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, department, phone } = body;

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: {
        user_id: user.id,
      },
      data: {
        full_name: full_name || undefined,
        department: department || undefined,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        profile: {
          id: updatedProfile.id,
          full_name: updatedProfile.full_name,
          email: updatedProfile.user.email,
          department: updatedProfile.department,
          role: updatedProfile.role,
          avatar_url: updatedProfile.avatar_url,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
