# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev              # Start development server on http://localhost:3000
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors automatically
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking without emit

# Database Operations
npm run db:setup         # Full setup: generate + migrate + seed
npm run db:reset         # Reset database and re-seed (destructive)
npm run prisma:migrate   # Create and apply migrations
npm run prisma:studio    # Open Prisma Studio GUI
npm run db:push          # Push schema changes to database (dev)

# Performance & Analysis
npm run analyze          # Analyze bundle size with @next/bundle-analyzer
npm run perf:build       # Build and analyze bundle together

# Validation
npm run validate         # Run type-check, lint, and format:check
```

## Architecture Overview

### Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **State Management**: React Query for server state
- **UI**: Tailwind CSS v4 with shadcn/ui components
- **Performance**: Next.js optimizations, code splitting, lazy loading

### Project Structure

```
app/
├── (auth)/              # Authentication routes (login, register, reset)
├── (dashboard)/         # Protected routes for authenticated users
│   ├── dashboard/       # Main dashboard
│   ├── leaves/          # Leave management pages
│   ├── calendar/        # Team calendar view
│   ├── notifications/   # Notification system
│   └── ...
├── api/                 # API routes (backend)
│   ├── auth/           # Authentication endpoints
│   ├── leaves/         # Leave management APIs
│   ├── notifications/  # Notification APIs
│   └── ...
├── globals.css          # Global styles with accessibility CSS
├── layout.tsx           # Root layout with skip links
└── providers.tsx        # React Query provider with optimized config

lib/
├── services/           # Business logic services
│   ├── leave-balance.ts    # Leave balance calculations
│   ├── notification.ts     # Notification creation helpers
│   └── ...
├── supabase/           # Supabase client configurations
│   ├── client.ts           # Browser client for Realtime
│   └── server.ts           # Server client for API routes
├── types/              # TypeScript type definitions
│   └── notification.ts     # Notification types
├── utils/              # Utility functions
│   └── date.ts              # Date formatting utilities
└── prisma.ts           # Prisma client singleton

components/
├── notifications/     # Notification system components
├── search/            # Global search components
├── forms/             # Form components
├── ui/                # shadcn/ui components
└── ...
```

### Key Architectural Patterns

1. **Authentication Flow**
   - Uses Supabase Auth with server-side and client-side clients
   - Middleware (`app/middleware.ts`) protects routes
   - Row Level Security (RLS) enforces data access at database level
   - Roles: EMPLOYEE, MANAGER, HR, ADMIN with granular permissions

2. **Data Fetching**
   - React Query with optimized caching (5min staleTime, 10min cacheTime)
   - API routes use server-side Supabase client
   - Real-time subscriptions via Supabase Realtime for notifications

3. **Performance Optimizations**
   - Lazy loading for heavy components (Calendar)
   - Tree-shakeable imports for date-fns and lodash
   - React Query DevTools in development
   - Bundle analyzer integrated with `npm run analyze`

4. **Accessibility**
   - Skip navigation links in root layout
   - Focus indicators with 3:1 contrast ratio
   - ARIA labels and semantic HTML
   - Screen reader support with live regions

### Database Schema

Core tables with relationships:

- `users` → `profiles` (1:1) - User authentication and profile data
- `profiles` → `leaves` (1:many) - Users can have many leave requests
- `leave_types` → `leaves` (1:many) - Leave type definitions
- `leaves` → `leave_balances` (affected) - Balance updates on leave actions
- `profiles` → `company_documents` (access control) - Document permissions
- `notification_logs` - User notifications with type system

### Notification System

Real-time notification system with:

- 10 notification types (LEAVE_CREATED, LEAVE_APPROVED, etc.)
- NotificationBell component with unread count badge
- Supabase Realtime subscriptions for instant updates
- API endpoints: `/api/notifications`, `/api/notifications/[id]/read`, `/api/notifications/read-all`
- Service layer helpers for easy notification creation

### Performance Features

- Font optimization with Next.js font (`Inter`) and display swap
- Component memoization with `React.memo`, `useMemo`, `useCallback`
- Bundle size optimization with `@next/bundle-analyzer`
- Optimized package imports for lucide-react and date-fns
- React Query with smart caching strategies

## Important Implementation Notes

1. **Always use the correct Supabase client**:
   - Use `lib/supabase/server.ts` in API routes and server components
   - Use `lib/supabase/client.ts` in client components for Realtime

2. **Database operations**:
   - Run `npm run db:setup` for initial database setup
   - Use Prisma migrations for schema changes
   - Test RLS policies with different user roles

3. **Performance**:
   - Lazy load heavy components using `next/dynamic`
   - Use React Query for all server state
   - Run `npm run analyze` to check bundle sizes

4. **Accessibility**:
   - All interactive elements need keyboard navigation
   - Use semantic HTML and ARIA labels
   - Test with screen readers and keyboard only

5. **Security**:
   - Never bypass RLS policies
   - Always validate user roles on server-side
   - Use server action for sensitive operations

## Current Status

The project is at **90% completion** with Phase 6 (UX Enhancement) complete and Phase 7 (Testing & Production Deployment) prepared for execution. All core features are implemented including leave management, notifications, search, document management, and admin dashboard. Performance optimizations and accessibility improvements are in place.
