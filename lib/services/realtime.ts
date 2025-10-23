/**
 * Realtime Service
 * Handles Supabase Realtime subscriptions for live updates
 */

import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

type SubscriptionCallback = (payload: any) => void;

class RealtimeService {
  private client = createClient();
  private subscriptions: Map<string, RealtimeChannel> = new Map();

  /**
   * Subscribe to leave changes for a user
   */
  subscribeToLeaves(userId: string, callback: SubscriptionCallback) {
    const channelName = `leaves:${userId}`;

    // Clean up existing subscription if any
    if (this.subscriptions.has(channelName)) {
      this.subscriptions.get(channelName)?.unsubscribe();
    }

    const channel = this.client
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaves",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Leave change received:", payload);
          callback(payload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaves",
          filter: `manager_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Team leave change received:", payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to leaves for user ${userId}`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(`Failed to subscribe to leaves for user ${userId}`);
        }
      });

    this.subscriptions.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to notifications for a user
   */
  subscribeToNotifications(userId: string, callback: SubscriptionCallback) {
    const channelName = `notifications:${userId}`;

    // Clean up existing subscription if any
    if (this.subscriptions.has(channelName)) {
      this.subscriptions.get(channelName)?.unsubscribe();
    }

    const channel = this.client
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification_logs",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("New notification:", payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to notifications for user ${userId}`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            `Failed to subscribe to notifications for user ${userId}`
          );
        }
      });

    this.subscriptions.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to team calendar updates for a manager
   */
  subscribeToTeamCalendar(
    managerId: string,
    callback: SubscriptionCallback,
    department?: string
  ) {
    const channelName = `calendar:${managerId}:${department || "all"}`;

    // Clean up existing subscription if any
    if (this.subscriptions.has(channelName)) {
      this.subscriptions.get(channelName)?.unsubscribe();
    }

    const channel = this.client
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaves",
        },
        async (payload) => {
          // Filter client-side based on department if specified
          if (department) {
            // Check if the leave belongs to someone in the manager's department
            // This would require fetching the user's department
            // For now, we'll send all changes and let the client filter
          }
          console.log("Calendar update:", payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to team calendar for manager ${managerId}`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            `Failed to subscribe to team calendar for manager ${managerId}`
          );
        }
      });

    this.subscriptions.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to document expiry notifications
   */
  subscribeToDocumentExpiry(callback: SubscriptionCallback) {
    const channelName = "document-expiry";

    // Clean up existing subscription if any
    if (this.subscriptions.has(channelName)) {
      this.subscriptions.get(channelName)?.unsubscribe();
    }

    const channel = this.client
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "company_documents",
          filter: "expiry_date=lt.now()+7d", // Documents expiring in next 7 days
        },
        (payload) => {
          console.log("Document expiry update:", payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to document expiry notifications");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Failed to subscribe to document expiry notifications");
        }
      });

    this.subscriptions.set(channelName, channel);
    return channel;
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName: string) {
    const channel = this.subscriptions.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.subscriptions.delete(channelName);
      console.log(`Unsubscribed from ${channelName}`);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll() {
    this.subscriptions.forEach((channel, name) => {
      channel.unsubscribe();
      console.log(`Unsubscribed from ${name}`);
    });
    this.subscriptions.clear();
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return this.client.realtime.isConnected();
  }

  /**
   * Manually refresh a subscription
   */
  async refreshSubscription(channelName: string) {
    // This would typically involve re-subscribing
    // Implementation depends on specific requirements
    console.log(`Refreshing subscription: ${channelName}`);
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();

// Export convenience functions
export const {
  subscribeToLeaves,
  subscribeToNotifications,
  subscribeToTeamCalendar,
  subscribeToDocumentExpiry,
  unsubscribe,
  unsubscribeAll,
  getConnectionStatus,
} = realtimeService;
