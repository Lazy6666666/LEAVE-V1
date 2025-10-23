"use client";

import { useEffect } from "react";
import { trackWebVitals, sendToAnalytics } from "@/lib/performance";

export function WebVitalsTracker() {
  useEffect(() => {
    // Only track in production or when explicitly enabled
    if (
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === "true"
    ) {
      const cleanup = trackWebVitals((metric) => {
        // Send to analytics service
        sendToAnalytics(metric);

        // Log in development
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Performance] ${metric.name}: ${Math.round(metric.value)}ms`
          );
        }
      });

      return cleanup;
    }
  }, []);

  return null;
}
