"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Create a client with optimized defaults
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: 5 minutes - data is fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Cache time: 10 minutes - data stays in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 3 times with exponential backoff
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Enable refetch on window focus
        refetchOnWindowFocus: true,
        // Don't refetch on reconnect by default (can be enabled per query)
        refetchOnReconnect: false,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        // Don't retry on 4xx errors
        retryDelay: 1000,
      },
    },
  });
}

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient());
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before enabling devtools
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Setup real-time subscriptions for query invalidation
  useEffect(() => {
    const channels: any[] = [];

    // Subscribe to leave changes
    const leaveChannel = supabase.channel("leave-changes").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "leaves",
      },
      () => {
        // Invalidate all leave-related queries
        queryClient.invalidateQueries({ queryKey: ["leaves"] });
        queryClient.invalidateQueries({ queryKey: ["calendar"] });
        queryClient.invalidateQueries({ queryKey: ["balances"] });
      }
    );
    channels.push(leaveChannel);

    // Subscribe to notification changes
    const notificationChannel = supabase.channel("notification-changes").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notification_logs",
      },
      () => {
        // Invalidate notification queries
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    );
    channels.push(notificationChannel);

    // Subscribe to profile changes
    const profileChannel = supabase.channel("profile-changes").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "profiles",
      },
      () => {
        // Invalidate profile and user queries
        queryClient.invalidateQueries({ queryKey: ["profiles"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    );
    channels.push(profileChannel);

    // Cleanup subscriptions
    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isClient && process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
