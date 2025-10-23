# Leave Management System

A modern, full-stack leave management system built with Next.js 14, Supabase, Prisma, and TypeScript. Features include employee leave tracking, role-based access control, document management, and comprehensive audit logging.

## Features

### Core Functionality

- **Leave Management**: Request, approve, reject, and track employee leave
- **Multiple Leave Types**: Annual, sick, personal, maternity, paternity, study, bereavement, and public holidays
- **Leave Balance Tracking**: Automatic calculation of used and remaining leave days
- **Approval Workflow**: Manager-based approval system with configurable rules

### Security & Access Control

- **Authentication**: Secure email/password authentication via Supabase Auth
- **Row Level Security (RLS)**: Database-level security policies
- **Role-Based Access Control (RBAC)**: Four role levels (Employee, Manager, HR, Admin)
- **Permission System**: Granular permissions for different operations

### Additional Features

- **Document Management**: Upload and manage company documents with access level controls
- **Notification System**: In-app notifications for leave requests and approvals
- **Audit Logging**: Comprehensive audit trail for all system actions
- **User Profiles**: Employee profiles with department and manager information
- **Company Settings**: Configurable system settings

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS (ready to configure)

## Quick Start

### Prerequisites

- Node.js 18 or higher
- A Supabase account (free tier works)
- Git

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd leave
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Wait for the project to be fully initialized (~2 minutes)

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Fill in your Supabase credentials in `.env.local`:
   - Get `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Settings > API**
   - Get `DATABASE_URL` from **Settings > Database > Connection String** (use Transaction mode)
   - Get `DIRECT_DATABASE_URL` (same as above, but use Direct mode or port 5432)

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Create and apply database migrations
npx prisma migrate dev --name init

# Seed the database with initial data
npm run db:seed
```

### 5. Apply Row Level Security Policies

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `prisma/rls-policies.sql`
5. Paste and execute the SQL

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 7. Login with Default Admin Account

```
Email: admin@company.com
Password: admin123
```

**⚠️ Important**: Change this password immediately in production!

## Project Structure

```
leave/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── reset-password/
│   │   └── update-password/
│   ├── api/
│   │   └── auth/           # API routes for auth
│   └── middleware.ts       # Next.js middleware
├── lib/
│   ├── supabase/           # Supabase clients
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── middleware.ts   # Middleware client
│   ├── auth/               # Auth utilities
│   │   ├── session.ts      # Session management
│   │   └── user.ts         # User profile utilities
│   ├── rbac/               # Role-based access control
│   │   └── permissions.ts  # Permission definitions
│   └── prisma.ts           # Prisma client singleton
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed data script
│   └── rls-policies.sql    # Row level security policies
├── SETUP.md                # Detailed setup guide
└── README.md               # This file
```

## Database Schema

### Core Tables

- **users**: Supabase auth users
- **profiles**: User profiles with role and department
- **leave_types**: Configurable leave types
- **leaves**: Leave requests and approvals
- **leave_balances**: Leave balance tracking per user/type/year
- **company_documents**: Document storage with access controls
- **notification_logs**: User notifications
- **audit_logs**: System audit trail
- **company_settings**: Configurable system settings

### Roles

- **EMPLOYEE**: Basic user with self-service capabilities
- **MANAGER**: Can approve team leave requests
- **HR**: Full access to leave management and user administration
- **ADMIN**: System administrator with full access

## Available Scripts

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

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create and apply migrations
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open Prisma Studio
npm run db:push          # Push schema changes (dev)
npm run db:seed          # Run seed script
```

## Authentication Flow

1. User visits `/login` or `/register`
2. Supabase handles authentication
3. On successful auth, user is redirected to `/dashboard`
4. Middleware checks auth state on protected routes
5. RLS policies enforce data access at database level

## Permission System

The system uses a comprehensive permission-based RBAC system. Permissions are defined in `lib/rbac/permissions.ts` and include:

- Leave management (create, view, approve, reject, cancel)
- User management (view, edit, create, delete, assign roles)
- Document management (view, upload, edit, delete)
- Reports and analytics
- System settings
- Audit logs

## Security Features

### Authentication

- Secure email/password authentication
- Email verification support
- Password reset functionality
- Session management with automatic refresh

### Authorization

- Role-based access control (RBAC)
- Permission-based authorization
- Row-level security (RLS) at database level
- Middleware-based route protection

### Data Protection

- Database-level security policies
- Audit logging for all sensitive operations
- Secure password hashing (handled by Supabase)
- HTTPS enforcement (in production)

## Environment Variables

Required variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database
DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional variables for production:

```env
# Service role key for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email configuration (if using custom SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@yourcompany.com
```

## Troubleshooting

See [SETUP.md](./SETUP.md) for detailed troubleshooting guide.

Common issues:

- **Database connection errors**: Check your DATABASE_URL is correct
- **Auth not working**: Verify Supabase credentials
- **RLS policies blocking queries**: Ensure policies are properly applied
- **Migration errors**: Delete `prisma/migrations` and run `npx prisma migrate dev` again

## Roadmap

### Phase 1 - Backend Foundation (COMPLETED ✅)

- [x] Authentication and authorization
- [x] Database schema with Prisma
- [x] RBAC and permissions system
- [x] Row Level Security policies
- [x] Seed data and admin user
- [x] Auth pages (login, register, reset password)

### Phase 2 - Frontend & Dashboard (NEXT)

- [ ] Install and configure Tailwind CSS + shadcn/ui
- [ ] Dashboard layouts and navigation
- [ ] Leave request forms
- [ ] Leave approval interface
- [ ] User profile pages
- [ ] Calendar view

### Phase 3 - Enhanced Features

- [ ] Document upload with Supabase Storage
- [ ] Email notifications
- [ ] Reports and analytics
- [ ] Team management interface
- [ ] Company settings UI
- [ ] Mobile responsive design

## Support

For detailed setup instructions, see [SETUP.md](./SETUP.md)

For issues, questions, or contributions:

- Review [Supabase Documentation](https://supabase.com/docs)
- Review [Prisma Documentation](https://www.prisma.io/docs)
- Review [Next.js Documentation](https://nextjs.org/docs)

## License

ISC
