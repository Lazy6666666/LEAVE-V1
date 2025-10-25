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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get("department");
    const role = searchParams.get("role");

    // Build query
    const whereClause: any = {};
    if (department && department !== "all") {
      whereClause.department = department;
    }
    if (role && role !== "all") {
      whereClause.role = role;
    }

    // Fetch team members from database
    const members = await prisma.profile.findMany({
      where: whereClause,
      select: {
        id: true,
        user_id: true,
        full_name: true,
        department: true,
        role: true,
        manager_id: true,
        avatar_url: true,
        created_at: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        full_name: "asc",
      },
    });

    // Transform data to match expected format
    const transformedMembers = members.map((member) => ({
      id: member.id,
      full_name: member.full_name,
      email: member.user.email,
      department: member.department,
      role: member.role,
      avatar_url: member.avatar_url,
      manager_id: member.manager_id,
      created_at: member.created_at.toISOString(),
    }));

    return NextResponse.json(
      {
        members: transformedMembers,
        total: transformedMembers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
