# Notification System Integration Guide

## T-036: Notification System Enhancement

This guide shows you how to integrate the NotificationBell component into your application layout.

## Quick Start

### 1. Add NotificationBell to Your Layout

Add the NotificationBell component to your dashboard header/navigation:

```tsx
// Example: app/(dashboard)/layout.tsx

import { NotificationBell } from "@/components/notifications/NotificationBell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Your Navigation/Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1>Leave Management System</h1>

          <div className="flex items-center gap-4">
            {/* Add the notification bell here */}
            <NotificationBell />

            {/* Other header items (profile, settings, etc.) */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
```

### 2. That's It!

The NotificationBell component is fully self-contained and will:

- Automatically fetch notifications on mount
- Subscribe to real-time updates via Supabase
- Show unread count badge
- Handle mark as read functionality
- Provide a link to the full notifications page

## Usage Examples

### Creating Notifications Programmatically

Use the notification service helpers:

```typescript
import {
  notifyLeaveApproved,
  notifyLeaveRejected,
  createNotification,
} from "@/lib/services/notification";

// Example: Notify when leave is approved
await notifyLeaveApproved(
  employeeId,
  leaveId,
  leaveDays,
  leaveType,
  approverName
);

// Example: Create custom notification
await createNotification({
  userId: "user-uuid",
  type: "SYSTEM_ANNOUNCEMENT",
  title: "System Maintenance",
  message: "The system will be down for maintenance on Sunday",
  link: "/announcements", // Optional
});
```

### Available Notification Helper Functions

From `lib/services/notification.ts`:

- `createNotification()` - General purpose notification creation
- `notifyLeaveRequestCreated()` - Notify managers of new leave request
- `notifyLeaveApproved()` - Notify employee when leave approved
- `notifyLeaveRejected()` - Notify employee when leave rejected
- `notifyLeaveCancelled()` - Notify managers when leave cancelled
- `notifyDocumentExpiring()` - Notify about expiring documents
- `notifyDocumentUploaded()` - Notify about new documents

### Notification Types

Available notification types (from `lib/types/notification.ts`):

- `LEAVE_CREATED` - Employee created a leave request
- `LEAVE_APPROVED` - Leave request was approved
- `LEAVE_REJECTED` - Leave request was rejected
- `LEAVE_CANCELLED` - Leave request was cancelled
- `LEAVE_REQUEST_PENDING` - For managers, new leave request pending
- `DOCUMENT_UPLOADED` - New document uploaded
- `DOCUMENT_EXPIRING` - Document expiring soon
- `DOCUMENT_EXPIRED` - Document has expired
- `DOCUMENT_DELETED` - Document was deleted
- `SYSTEM_ANNOUNCEMENT` - System-wide announcement

## API Endpoints

### GET /api/notifications

Fetch user's notifications

Query Parameters:

- `limit` (number, default: 10) - Number of notifications to fetch
- `offset` (number, default: 0) - Pagination offset
- `unreadOnly` (boolean) - Only fetch unread notifications
- `type` (NotificationType) - Filter by notification type

Response:

```json
{
  "notifications": [...],
  "total": 100,
  "unreadCount": 5
}
```

### PATCH /api/notifications/[id]/read

Mark a single notification as read

Response:

```json
{
  "message": "Notification marked as read",
  "notification": {...}
}
```

### POST /api/notifications/read-all

Mark all user's notifications as read

Response:

```json
{
  "message": "All notifications marked as read",
  "count": 10
}
```

## Real-time Updates

The notification system uses Supabase Realtime to provide instant updates:

- New notifications appear immediately without page refresh
- Unread count updates in real-time
- Notification status (read/unread) syncs across all open tabs
- Automatic reconnection on connection drops

### How It Works

1. **Subscription Setup**: When NotificationBell mounts, it subscribes to the `notification_logs` table
2. **Filtering**: Supabase RLS (Row Level Security) ensures users only see their own notifications
3. **Events**: Listens for INSERT and UPDATE events
4. **State Updates**: Local state updates immediately when changes are detected

## Customization

### Styling

The components use Tailwind CSS and can be customized:

```tsx
// components/notifications/NotificationBell.tsx
// Modify the PopoverContent className for glassmorphism effects
<PopoverContent
  className="w-96 p-0 bg-white/95 backdrop-blur-lg border shadow-xl"
  // Add your custom classes here
>
```

### Notification Sounds/Toasts

Add sound or toast notifications in `NotificationBell.tsx`:

```tsx
.on("postgres_changes", ..., (payload) => {
  const newNotification = payload.new as Notification;

  // Add your custom notification sound/toast here
  playNotificationSound();
  showToast(newNotification.title);

  setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
  // ...
})
```

## Troubleshooting

### Notifications Not Appearing

1. **Check Supabase RLS Policies**: Ensure users can read their own notifications

   ```sql
   -- Example RLS policy
   CREATE POLICY "Users can view own notifications"
   ON notification_logs
   FOR SELECT
   USING (auth.uid() = user_id);
   ```

2. **Check Realtime Subscription**: Look for console logs
   - "Connected to notification updates" = Success
   - Errors = Check Supabase project settings

3. **Verify Environment Variables**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

### Real-time Not Working

1. **Enable Realtime in Supabase**:
   - Go to Database > Replication
   - Enable replication for `notification_logs` table

2. **Check Browser Console**: Look for WebSocket errors

3. **Test with Database Operations**: Insert a test notification directly in the database and see if it appears

## Performance Considerations

- **Limit Subscriptions**: Only subscribe where needed (don't subscribe on every component)
- **Pagination**: Use limit/offset for large notification lists
- **Cleanup**: Subscriptions are automatically cleaned up on component unmount
- **Batching**: Consider batching notifications for high-volume scenarios

## Security

- ✅ Authentication required for all API endpoints
- ✅ Users can only access their own notifications
- ✅ Supabase RLS policies enforce data isolation
- ✅ Server-side validation on all mutations
- ✅ No sensitive data exposed in notification messages

## Next Steps

1. **Add to your layout** - Follow the Quick Start guide above
2. **Set up RLS policies** - Configure Row Level Security in Supabase
3. **Enable Realtime** - Enable replication for notification_logs table
4. **Test** - Create test notifications and verify real-time updates
5. **Customize** - Adjust styling and behavior to match your needs

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the Supabase Realtime documentation
3. Examine the notification_logs table schema
4. Check browser console for errors
