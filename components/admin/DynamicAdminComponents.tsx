/**
 * Dynamic Admin Components for Code Splitting
 * Loads admin functionality only when needed
 */

import dynamic from "next/dynamic";
import { Loader2 } from "@/lib/utils/icons";

// Loading component
const AdminLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span className="ml-2">Loading admin panel...</span>
  </div>
);

// Dynamically import admin components
export const AdminAnalytics = dynamic(
  () => import("@/components/analytics/analytics-charts").then((mod) => mod.default),
  {
    loading: AdminLoadingFallback,
    ssr: false
  }
);

export const AdminPerformance = dynamic(
  () => import("@/app/(dashboard)/admin/performance/page").then((mod) => mod.default),
  {
    loading: AdminLoadingFallback,
    ssr: false
  }
);

export const AdminAuditLogs = dynamic(
  () => import("@/app/(dashboard)/admin/audit-logs/page").then((mod) => mod.default),
  {
    loading: AdminLoadingFallback,
    ssr: false
  }
);

export const AdminSecurityMFA = dynamic(
  () => import("@/app/(dashboard)/admin/security/mfa/page").then((mod) => mod.default),
  {
    loading: AdminLoadingFallback,
    ssr: false
  }
);

export const AdminUserManagement = dynamic(
  () => import("@/app/(dashboard)/admin/users/page").then((mod) => mod.default),
  {
    loading: AdminLoadingFallback,
    ssr: false
  }
);

export const AdminSettings = dynamic(
  () => import("@/app/(dashboard)/admin/settings/page").then((mod) => mod.default),
  {
    loading: AdminLoadingFallback,
    ssr: false
  }
);