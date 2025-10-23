# Quick Start Guide: Leave Management System

**Purpose**: Quick reference for developers working on the Leave Management System feature

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project created
- PostgreSQL database (via Supabase)

### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd leave-management

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run initial migration
npm run db:migrate

# Seed database with initial data
npm run db:seed
```

### Start Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

## Key Development Commands

```bash
# Database Operations
npm run db:generate      # Generate Prisma client
npm run db:push         # Push schema to dev database
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset and reseed database

# Development
npm run dev             # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run format          # Format with Prettier
npm run type-check      # TypeScript type check

# Testing
npm run test            # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## Core Concepts

### Authentication Flow

1. User registers/logs in via Supabase Auth
2. JWT token stored in secure cookie
3. Middleware protects routes
4. Server-side client used for API routes
5. Client-side client used for real-time subscriptions

### Role-Based Access Control

```typescript
// Check user role
import { canUserAccess } from "@/lib/rbac/permissions";

if (canUserAccess(user.role, "approve_leave")) {
  // Allow action
}
```

### Database Patterns

```typescript
// Server-side - use server client
import { createServerClient } from "@/lib/supabase/server";
const supabase = createServerClient();

// Client-side - use client client
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
```

### Real-time Subscriptions

```typescript
// Listen for leave changes
const subscription = supabase
  .channel("leaves")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "leaves" },
    (payload) => updateUI(payload)
  )
  .subscribe();
```

## File Structure Guide

### Adding New Features

1. Create component in `components/[feature]/`
2. Add page in `app/(dashboard)/[feature]/`
3. Create API routes in `app/api/[feature]/`
4. Add types in `types/[feature].ts`
5. Write tests in `__tests__/[feature]/`

### Component Organization

```
components/
├── ui/                 # shadcn/ui components
├── forms/              # Form components
│   ├── LeaveRequestForm.tsx
│   └── DocumentUploadForm.tsx
├── calendar/           # Calendar components
├── documents/          # Document components
└── notifications/      # Notification components
```

## Common Patterns

### Form Validation

```typescript
import { z } from "zod";

const leaveRequestSchema = z.object({
  leaveTypeId: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().optional(),
});
```

### API Route Pattern

```typescript
// app/api/leaves/route.ts
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function POST(request: Request) {
  const supabase = createServerClient();
  const body = await request.json();

  // Validate
  const validated = leaveRequestSchema.parse(body);

  // Process
  // ...
}
```

### Server Action Pattern

```typescript
// app/actions/leaves.ts
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveLeave(leaveId: string) {
  const supabase = createServerClient();

  // Update with RLS protection
  const { error } = await supabase
    .from("leaves")
    .update({ status: "APPROVED" })
    .eq("id", leaveId);

  revalidatePath("/leaves");
}
```

## Testing Guide

### Unit Test Example

```typescript
// __tests__/services/leave-balance.test.ts
import { calculateLeaveBalance } from "@/lib/services/leave-balance";

test("calculates balance correctly", () => {
  const balance = calculateLeaveBalance({
    allocated: 20,
    used: 5,
    reserved: 2,
  });

  expect(balance.available).toBe(13);
});
```

### E2E Test Example

```typescript
// __tests__/e2e/leave-request.spec.ts
import { test, expect } from "@playwright/test";

test("can submit leave request", async ({ page }) => {
  await page.goto("/leaves/new");
  await page.fill('[data-testid="leave-type"]', "Annual Leave");
  await page.fill('[data-testid="start-date"]', "2024-12-25");
  await page.fill('[data-testid="end-date"]', "2024-12-26");
  await page.click('[data-testid="submit"]');

  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

## Troubleshooting

### Common Issues

**RLS Policy Errors**

- Check policies in Supabase dashboard
- Ensure using correct client (server vs client)
- Verify user authentication state

**Type Errors**

- Run `npm run db:generate` after schema changes
- Check Prisma types match database
- Ensure strict TypeScript mode

**Real-time Not Working**

- Check RLS policies allow subscription
- Verify Supabase Realtime enabled
- Check browser console for errors

**Performance Issues**

- Use React DevTools Profiler
- Check bundle size with `npm run analyze`
- Optimize images and lazy load components

### Debug Commands

```bash
# Check Prisma schema
npx prisma studio

# Analyze bundle
npm run analyze

# Run type check
npm run type-check

# Check RLS policies
npx supabase db dump --data-only --schema=public
```

## Deployment

### Environment Variables

```bash
# Production
NEXT_PUBLIC_SUPABASE_URL=production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_anon_key
SUPABASE_SERVICE_ROLE_KEY=production_service_key
DATABASE_URL=supabase_db_url
```

### Build Commands

```bash
# Build for production
npm run build

# Start production
npm start

# Check build
npm run analyze
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Project Constitution](../../../.specify/memory/constitution.md)
