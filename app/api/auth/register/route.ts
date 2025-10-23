/**
 * Registration API Route
 *
 * Creates user profile in database after Supabase auth signup
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  ValidationMiddleware,
  SQLInjectionProtection,
  RequestTracker,
} from "@/lib/middleware/validation-middleware";

// Registration schema
const registrationSchema = z.object({
  userId: ValidationMiddleware.schemas.uuid,
  fullName: z.string().min(1).max(100),
  department: z.string().max(50).optional(),
  email: ValidationMiddleware.schemas.email,
});

export async function POST(request: NextRequest) {
  // Generate request ID for tracing
  const requestId = RequestTracker.generateRequestId();

  try {
    // Apply validation middleware
    const validationMiddleware = ValidationMiddleware.create({
      schema: registrationSchema,
      sanitize: true,
      maxBodySize: 1024, // 1KB limit
      allowedMethods: ["POST"],
    });

    const validationResult = await validationMiddleware(request);
    if (validationResult) {
      RequestTracker.addRequestId(validationResult, requestId);
      return validationResult;
    }

    // Get validated body from headers
    const validatedBody = JSON.parse(
      request.headers.get("x-validated-body") || "{}"
    );
    const { userId, fullName, department, email } = validatedBody;

    // Additional security check for SQL injection
    if (
      !SQLInjectionProtection.validateQueryParams({ userId, email, department })
    ) {
      const response = NextResponse.json(
        { error: "Invalid input detected" },
        { status: 400 }
      );
      RequestTracker.addRequestId(response, requestId);
      return response;
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

    const response = NextResponse.json(
      {
        message: "Profile created successfully",
        profile,
      },
      { status: 201 }
    );
    RequestTracker.addRequestId(response, requestId);
    return response;
  } catch (error: unknown) {
    console.error(`Registration error [${requestId}]:`, error);

    // Don't expose detailed errors in production
    const isDevelopment = process.env.NODE_ENV === "development";
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorDetails = isDevelopment ? errorMessage : "Registration failed";

    const response = NextResponse.json(
      { error: "Internal server error", details: errorDetails },
      { status: 500 }
    );
    RequestTracker.addRequestId(response, requestId);
    return response;
  }
}
