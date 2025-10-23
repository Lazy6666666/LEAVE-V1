---
name: LEAVE-V1 Repository Guide
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers: []
---

# LEAVE-V1 Repository Guide

## Purpose of this Repository

LEAVE-V1 is a modern, full-stack leave management system designed for organizations to efficiently manage employee leave requests, approvals, and tracking. The system provides:

- **Employee Self-Service**: Employees can request leave, view their leave balance, and track request status
- **Manager Approval Workflow**: Managers can approve/reject team leave requests with proper authorization
- **HR Administration**: HR personnel can manage leave types, user roles, and system-wide settings
- **Comprehensive Tracking**: Complete audit trail and leave balance management across multiple leave types
- **Document Management**: Upload and manage company documents with role-based access controls

The system supports multiple leave types (annual, sick, personal, maternity, paternity, study, bereavement, public holidays) with automatic balance calculations and role-based access control.

## General Setup of this Repository

### Technology Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Backend**: Next.js API Routes and Server Actions
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Styling**: Tailwind CSS (configured but not fully implemented)
- **State Management**: React Query (@tanstack/react-query)
- **Form Handling**: React Hook Form with Zod validation

### Key Dependencies

- `@prisma/client` & `@prisma/extension-accelerate` - Database ORM and acceleration
- `@supabase/supabase-js` & `@supabase/ssr` - Supabase client and SSR support
- `@tanstack/react-query` - Server state management
- `react-hook-form` & `@hookform/resolvers` - Form handling
- `zod` - Schema validation
- `date-fns` - Date manipulation
- `lucide-react` - Icon library
- `react-big-calendar` - Calendar component

### Development Tools

- **Linting**: ESLint with Next.js and Prettier configurations
- **Formatting**: Prettier with consistent code style
- **Type Checking**: TypeScript with strict mode enabled
- **Database**: Prisma CLI for migrations and schema management

### Environment Requirements

- Node.js 18 or higher
- Supabase account (free tier supported)
- PostgreSQL database (via Supabase)

## Repository Structure

```
LEAVE-V1/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication route group
│   │   ├── reset-password/       # Password reset page
│   │   └── update-password/      # Password update page
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── calendar/             # Calendar view
│   │   ├── documents/            # Document management
│   │   ├── employee/             # Employee dashboard
│   │   └── manager/              # Manager dashboard
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── calendar/             # Calendar data endpoints
│   │   ├── documents/            # Document management endpoints
│   │   ├── leave-types/          # Leave type management
│   │   └── leaves/               # Leave request endpoints
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # UI components (shadcn/ui ready)
│   ├── forms/                    # Form components
│   └── layouts/                  # Layout components
├── lib/                          # Utility libraries
│   ├── auth/                     # Authentication utilities
│   ├── rbac/                     # Role-based access control
│   ├── supabase/                 # Supabase client configurations
│   └── utils/                    # General utility functions
├── prisma/                       # Database schema and migrations
│   ├── migrations/               # Database migration files
│   ├── schema.prisma             # Database schema definition
│   └── seed.ts                   # Database seeding script
├── types/                        # TypeScript type definitions
└── Configuration Files:
    ├── .env.local.example        # Environment variables template
    ├── .eslintrc.json            # ESLint configuration
    ├── .prettierrc               # Prettier configuration
    ├── next.config.js            # Next.js configuration
    ├── package.json              # Dependencies and scripts
    └── tsconfig.json             # TypeScript configuration
```

### Key Database Models

- **User**: Supabase auth users
- **Profile**: User profiles with roles (EMPLOYEE, MANAGER, HR, ADMIN)
- **LeaveType**: Configurable leave types with balance rules
- **Leave**: Leave requests with approval workflow
- **LeaveBalance**: Leave balance tracking per user/type/year
- **CompanyDocument**: Document storage with access level controls
- **NotificationLog**: In-app notification system
- **AuditLog**: Comprehensive audit trail
- **CompanySettings**: System configuration

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking
npm run validate         # Run all quality checks

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create and apply migrations
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open Prisma Studio
npm run db:setup         # Complete database setup
npm run db:reset         # Reset database with seed data
```

## CI/CD Configuration

**Status**: No GitHub workflows configured

- No `.github/workflows/` directory found
- No automated CI/CD pipeline currently set up
- Manual testing and deployment process

**Recommended CI/CD Setup**:

- Code quality checks (lint, format, type-check)
- Automated testing (when test suite is implemented)
- Database migration validation
- Build verification
- Deployment automation

## Development Phases

The project follows a phased development approach:

### Phase 1 - Backend Foundation (✅ COMPLETED)

- Authentication and authorization system
- Database schema with Prisma
- RBAC and permissions system
- Row Level Security policies
- Seed data and admin user setup
- Basic auth pages

### Phase 2 - Frontend & Dashboard (✅ COMPLETED)

- Tailwind CSS + shadcn/ui integration
- Dashboard layouts and navigation
- Leave request forms and approval interface
- User profile management
- Calendar view implementation

### Phase 3 - Enhanced Features (✅ COMPLETED)

- Document upload with Supabase Storage
- Notification system
- Reports and analytics
- Team management interface
- Company settings UI

### Phase 4 - Production Ready (✅ COMPLETED)

- Mobile responsive design
- Performance optimizations
- Security enhancements
- Production deployment setup

## Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Role-based access control (RBAC)
- **Database Security**: Row Level Security (RLS) policies
- **Route Protection**: Middleware-based authentication checks
- **Audit Logging**: Comprehensive audit trail for sensitive operations
- **Data Validation**: Zod schema validation on forms and API endpoints

## Default Admin Access

- Email: `admin@company.com`
- Password: `admin123`
- **⚠️ Important**: Change this password immediately in production!
