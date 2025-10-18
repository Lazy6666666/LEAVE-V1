/**
 * Registration API Route
 *
 * Creates user profile in database after Supabase auth signup
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, department, email } = body;

    // Validate required fields
    if (!userId || !fullName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      // Create user record
      await prisma.user.create({
        data: {
          id: userId,
          email: email,
        },
      });
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 409 }
      );
    }

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        user_id: userId,
        full_name: fullName,
        department: department || null,
        role: "EMPLOYEE", // Default role
      },
    });

    // Create leave balances for the current year
    const currentYear = new Date().getFullYear();
    const leaveTypes = await prisma.leaveType.findMany({
      where: { active: true },
    });

    // Create leave balances
    await Promise.all(
      leaveTypes.map((leaveType) =>
        prisma.leaveBalance.create({
          data: {
            user_id: userId,
            leave_type_id: leaveType.id,
            year: currentYear,
            total_days: leaveType.annual_quota,
            used_days: 0,
            remaining_days: leaveType.annual_quota,
          },
        })
      )
    );

    return NextResponse.json(
      {
        message: "Profile created successfully",
        profile,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
