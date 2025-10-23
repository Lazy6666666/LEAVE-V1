import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
// Database type removed - not needed for current implementation
import type { Profile, Role } from "@prisma/client";

export interface SessionConfig {
  maxAge: number; // Maximum session duration in seconds
  refreshThreshold: number; // Refresh session if less than this many seconds remaining
  inactivityTimeout: number; // Auto-logout after inactivity in seconds
}

export async function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerComponentClient({
    cookies: () => cookieStore,
  });
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile as Profile;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  if (!user || !profile) {
    throw new Error("Authentication required");
  }

  return { user, profile };
}

export async function requireRole(requiredRole: Role) {
  const { user, profile } = await requireAuth();

  if (profile.role !== requiredRole && profile.role !== "ADMIN") {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }

  return { user, profile };
}

export async function requireAnyRole(roles: Role[]) {
  const { user, profile } = await requireAuth();

  if (!roles.includes(profile.role) && profile.role !== "ADMIN") {
    throw new Error(
      `Insufficient permissions. Required one of: ${roles.join(", ")}`
    );
  }

  return { user, profile };
}

export async function isManager(profile: Profile) {
  return (
    profile.role === "MANAGER" ||
    profile.role === "ADMIN" ||
    profile.role === "HR"
  );
}

export async function isHR(profile: Profile) {
  return profile.role === "HR" || profile.role === "ADMIN";
}

export async function isAdmin(profile: Profile) {
  return profile.role === "ADMIN";
}

export async function canAccessUserResource(
  currentProfile: Profile,
  targetUserId: string
) {
  // Users can access their own resources
  if (currentProfile.id === targetUserId) {
    return true;
  }

  // Managers can access their team members' resources
  if (currentProfile.role === "MANAGER") {
    const supabase = await createServerSupabaseClient();
    const { data: member } = await supabase
      .from("profiles")
      .select("manager_id")
      .eq("id", targetUserId)
      .eq("manager_id", currentProfile.id)
      .single();

    return !!member;
  }

  // HR and Admin can access all resources
  return currentProfile.role === "HR" || currentProfile.role === "ADMIN";
}

// Session management functions
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxAge: 8 * 60 * 60, // 8 hours
  refreshThreshold: 15 * 60, // 15 minutes
  inactivityTimeout: 30 * 60, // 30 minutes of inactivity
};

/**
 * Get current session with validation
 */
export async function getCurrentSession(
  config: SessionConfig = DEFAULT_SESSION_CONFIG
) {
  const supabase = createClient();

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return { session: null, valid: false, needsRefresh: false };
    }

    // Check session age - use created_at if available, otherwise estimate from token
    const now = Math.floor(Date.now() / 1000);
    const sessionAge = 0; // Default to 0 for now, could be calculated from JWT claims if needed
    const expiresAt = session.expires_at
      ? Math.floor(new Date(session.expires_at).getTime() / 1000)
      : now + config.maxAge;
    const timeRemaining = expiresAt - now;

    // Check if session is expired
    if (timeRemaining <= 0 || sessionAge > config.maxAge) {
      await supabase.auth.signOut();
      return { session: null, valid: false, needsRefresh: false };
    }

    // Check if session needs refresh
    const needsRefresh = timeRemaining <= config.refreshThreshold;

    return {
      session,
      valid: true,
      needsRefresh,
      timeRemaining,
      sessionAge,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return { session: null, valid: false, needsRefresh: false };
  }
}

/**
 * Refresh session if needed
 */
export async function refreshSessionIfNeeded(
  config: SessionConfig = DEFAULT_SESSION_CONFIG
) {
  const { session, valid, needsRefresh } = await getCurrentSession(config);

  if (!valid || !session) {
    return { session: null, refreshed: false };
  }

  if (needsRefresh) {
    try {
      const supabase = createClient();
      const {
        data: { session: refreshedSession },
        error,
      } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Error refreshing session:", error);
        await supabase.auth.signOut();
        return { session: null, refreshed: false };
      }

      return { session: refreshedSession, refreshed: true };
    } catch (error) {
      console.error("Error refreshing session:", error);
      return { session, refreshed: false };
    }
  }

  return { session, refreshed: false };
}

/**
 * Check session activity and timeout
 */
export async function checkSessionActivity(
  userId: string,
  config: SessionConfig = DEFAULT_SESSION_CONFIG
) {
  const supabase = createClient();

  try {
    // Get last activity timestamp (you'll need to implement this table)
    const { data: activity } = await supabase
      .from("user_activities")
      .select("last_activity_at")
      .eq("user_id", userId)
      .single();

    if (!activity) {
      // First activity, record it
      await supabase.from("user_activities").upsert({
        user_id: userId,
        last_activity_at: new Date().toISOString(),
      });
      return { active: true, timedOut: false };
    }

    const now = Math.floor(Date.now() / 1000);
    const lastActivity = Math.floor(
      new Date(activity.last_activity_at).getTime() / 1000
    );
    const inactiveTime = now - lastActivity;

    if (inactiveTime > config.inactivityTimeout) {
      // Session timed out due to inactivity
      await supabase.auth.signOut();
      return { active: false, timedOut: true, inactiveTime };
    }

    // Update activity timestamp
    await supabase
      .from("user_activities")
      .update({
        last_activity_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return { active: true, timedOut: false, inactiveTime };
  } catch (error) {
    console.error("Error checking session activity:", error);
    return { active: true, timedOut: false };
  }
}

/**
 * Update user activity timestamp
 */
export async function updateUserActivity(userId: string) {
  const supabase = createClient();

  try {
    await supabase.from("user_activities").upsert({
      user_id: userId,
      last_activity_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating user activity:", error);
  }
}

/**
 * Validate session for API routes
 */
export async function validateSessionForAPI(
  config: SessionConfig = DEFAULT_SESSION_CONFIG
) {
  const { session, valid, needsRefresh } = await getCurrentSession(config);

  if (!valid || !session) {
    throw new Error("Invalid or expired session");
  }

  // Check activity timeout
  const activityCheck = await checkSessionActivity(session.user.id, config);
  if (!activityCheck.active) {
    throw new Error("Session timed out due to inactivity");
  }

  // Refresh if needed
  if (needsRefresh) {
    await refreshSessionIfNeeded(config);
  }

  return session;
}

/**
 * Enhanced authentication with session management
 */
export async function getCurrentUserWithSession(
  config: SessionConfig = DEFAULT_SESSION_CONFIG
) {
  const session = await validateSessionForAPI(config);
  return session?.user || null;
}

/**
 * Get enhanced profile with session validation
 */
export async function getCurrentProfileWithSession(
  config: SessionConfig = DEFAULT_SESSION_CONFIG
) {
  const session = await validateSessionForAPI(config);

  if (!session) {
    return null;
  }

  const supabase = createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile as Profile;
}

/**
 * Force sign out user
 */
export async function forceSignOut(userId: string, reason?: string) {
  const supabase = createClient();

  try {
    // Delete user sessions
    await supabase.auth.admin.signOut(userId);

    // Clear activity record
    await supabase.from("user_activities").delete().eq("user_id", userId);

    // Log the forced sign out
    console.log(
      `User ${userId} forcefully signed out${reason ? `: ${reason}` : ""}`
    );

    return true;
  } catch (error) {
    console.error("Error forcing sign out:", error);
    return false;
  }
}
