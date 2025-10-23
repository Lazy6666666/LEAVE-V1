# Notification System - Quick Start Guide

🚀 Get your notification system up and running in 5 minutes!

## Step 1: Configure Supabase (2 minutes)

### 1.1 Run SQL Setup

Open your Supabase SQL Editor and run:

```bash
supabase_notification_setup.sql
```

Or manually:

```sql
-- Enable RLS
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notifications
CREATE POLICY "Users can view own notifications"
ON notification_logs FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to mark as read
CREATE POLICY "Users can update own notifications"
ON notification_logs FOR UPDATE
USING (auth.uid() = user_id);

-- Allow system to create notifications
CREATE POLICY "System can insert notifications"
ON notification_logs FOR INSERT
WITH CHECK (true);
```

### 1.2 Enable Realtime

1. Go to **Database → Replication** in Supabase Dashboard
2. Find `notification_logs` table
3. Click **Enable** for realtime replication

✅ **Supabase is ready!**

---

## Step 2: Add to Your Layout (2 minutes)

### Option A: Create a Dashboard Layout (Recommended)

Create `app/(dashboard)/layout.tsx`:

```tsx
import { NotificationBell } from "@/components/notifications/NotificationBell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Leave Management System</h1>

          <div className="flex items-center gap-4">
            {/* Add Notification Bell */}
            <NotificationBell />

            {/* Your other header items */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}
```

### Option B: Add to Existing Layout

Find your existing dashboard layout and add:

```tsx
import { NotificationBell } from "@/components/notifications/NotificationBell";

// In your header/navigation:
<NotificationBell />;
```

✅ **NotificationBell is now visible!**

---

## Step 3: Test It! (1 minute)

### 3.1 Create a Test Notification

Open your browser console and run:

```javascript
// Create a test notification via API
await fetch("/api/notifications/test", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "SYSTEM_ANNOUNCEMENT",
    title: "Test Notification",
    message: "Your notification system is working! 🎉",
  }),
});
```

Or insert directly in Supabase SQL Editor:

```sql
INSERT INTO notification_logs (user_id, type, title, message)
VALUES (
  (SELECT id FROM users LIMIT 1),  -- Gets first user ID
  'SYSTEM_ANNOUNCEMENT',
  'Test Notification',
  'Your notification system is working! 🎉'
);
```

### 3.2 Verify Real-time Works

1. Open your app in two browser tabs
2. Insert a notification (using SQL above)
3. Watch both tabs update instantly! ⚡

✅ **Everything is working!**

---

## You're Done! 🎉

Your notification system is now:

- ✅ Showing in the header
- ✅ Displaying real-time updates
- ✅ Ready to use throughout your app

---

## Next Steps

### Use Notifications in Your Code

```typescript
import { createNotification } from "@/lib/services/notification";

// Example: Notify user when leave is approved
await createNotification({
  userId: employeeId,
  type: "LEAVE_APPROVED",
  title: "Leave Approved! 🎉",
  message: "Your 3-day Annual Leave request has been approved",
  link: "/employee/my-leaves",
});
```

### Available Helper Functions

```typescript
import {
  notifyLeaveApproved,
  notifyLeaveRejected,
  notifyLeaveRequestCreated,
  notifyLeaveCancelled,
  notifyDocumentUploaded,
  notifyDocumentExpiring,
} from "@/lib/services/notification";
```

### View All Notifications Page

Navigate to: `/notifications`

This page includes:

- Search functionality
- Filters (type, read status)
- Bulk actions
- Pagination

---

## Troubleshooting

### ❌ Notifications not appearing?

1. **Check RLS policies are created**:

   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notification_logs';
   ```

2. **Verify Realtime is enabled**:
   - Go to Database → Replication in Supabase
   - Ensure `notification_logs` is enabled

3. **Check browser console**:
   - Look for "Connected to notification updates" message
   - Check for any error messages

### ❌ Real-time not working?

1. **Check environment variables**:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

2. **Check Supabase Realtime quota**:
   - Free tier: 200 concurrent connections
   - Ensure you haven't hit the limit

### ❌ Badge count wrong?

1. **Refresh the page** - count syncs on mount
2. **Check if user_id matches** in database
3. **Verify RLS policies** allow user to see their notifications

---

## Need Help?

- 📖 **Full Documentation**: See `T036_NOTIFICATION_SYSTEM_COMPLETE.md`
- 🔧 **Integration Guide**: See `NOTIFICATION_INTEGRATION_GUIDE.md`
- 💾 **SQL Setup**: See `supabase_notification_setup.sql`

---

## Feature Overview

| Feature                 | Status     |
| ----------------------- | ---------- |
| Real-time updates       | ✅ Working |
| Unread count badge      | ✅ Working |
| Mark as read            | ✅ Working |
| Mark all as read        | ✅ Working |
| Notification dropdown   | ✅ Working |
| Full notifications page | ✅ Working |
| Search & filters        | ✅ Working |
| Mobile responsive       | ✅ Working |
| Glassmorphism design    | ✅ Working |
| TypeScript types        | ✅ Working |

---

**Enjoy your new notification system! 🔔**
