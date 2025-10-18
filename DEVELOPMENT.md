# Development Guide - Leave Management System

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Setup database
npm run db:setup

# 4. Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run validate` | Run type-check, lint, and format checks |

### Database

| Command | Description |
|---------|-------------|
| `npm run db:setup` | Complete database setup (generate, migrate, seed) |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:reset` | Reset database and re-seed |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Create and apply migration |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |

### Code Quality

| Command | Description |
|---------|-------------|
| `npm run type-check` | Check TypeScript types |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

---

## Project Structure

```
LEAVE/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # Authentication pages
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── reset-password/  # Password reset
│   │   └── update-password/ # Update password after reset
│   ├── (dashboard)/         # Dashboard routes (protected)
│   │   ├── employee/        # Employee dashboard
│   │   ├── manager/         # Manager dashboard
│   │   └── admin/           # Admin dashboard
│   ├── api/                 # API routes
│   │   └── auth/            # Auth-related APIs
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
│
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── forms/               # Form components
│   └── layouts/             # Layout components
│
├── lib/                     # Utilities and configurations
│   ├── supabase/            # Supabase clients
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── middleware.ts    # Middleware client
│   ├── auth/                # Authentication utilities
│   │   ├── session.ts       # Session management
│   │   └── user.ts          # User utilities
│   ├── rbac/                # Role-based access control
│   │   └── permissions.ts   # Permission system
│   ├── utils/               # General utilities
│   ├── validations/         # Zod validation schemas
│   └── prisma.ts            # Prisma client singleton
│
├── prisma/                  # Database
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Seed data
│   └── rls-policies.sql     # Row Level Security policies
│
├── types/                   # TypeScript types
├── public/                  # Static assets
└── middleware.ts            # Next.js middleware (auth protection)
```

---

## Environment Variables

### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database Configuration (from Supabase Settings > Database)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:6543/postgres?pgbouncer=true
DIRECT_DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project or select existing
3. Navigate to **Settings** > **API**
4. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Navigate to **Settings** > **Database**
7. Copy **Connection Pooling URL** → `DATABASE_URL`
8. Copy **Connection String (Session Mode)** → `DIRECT_DATABASE_URL`

---

## Database Setup

### Initial Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Seed database with initial data
npm run db:seed
```

### Apply Row Level Security Policies

1. Open Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy contents of `prisma/rls-policies.sql`
4. Paste and run in SQL Editor

### Database GUI

```bash
# Open Prisma Studio
npm run prisma:studio
```

Visit `http://localhost:5555` to view and edit database records.

---

## Authentication

### Default Users

After seeding, the following users are available:

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | admin123 | ADMIN |

**⚠️ Change default credentials in production!**

### Testing Authentication

1. Start development server: `npm run dev`
2. Navigate to `/login`
3. Use default admin credentials
4. You should be redirected to dashboard

---

## Role-Based Access Control (RBAC)

### Available Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **EMPLOYEE** | Regular employee | Submit leave requests, view own data |
| **MANAGER** | Team manager | Approve team leave, view team data |
| **HR** | HR personnel | Manage documents, view all leave |
| **ADMIN** | System administrator | Full system access, user management |

### Permission System

Permissions are managed in `lib/rbac/permissions.ts`. Use helper functions:

```typescript
import { hasPermission, requirePermission } from '@/lib/rbac/permissions';

// Check if user has permission
if (await hasPermission(userId, 'leave.approve')) {
  // User can approve leave
}

// Require permission (throws error if not authorized)
await requirePermission(userId, 'user.edit');
```

---

## Development Workflow

### Creating New Features

1. **Database Changes**:
   ```bash
   # Modify prisma/schema.prisma
   npm run prisma:migrate
   ```

2. **API Routes**:
   - Create in `app/api/[feature]/route.ts`
   - Use server-side Supabase client from `lib/supabase/server.ts`
   - Validate with Zod schemas

3. **UI Components**:
   - Create in `components/[category]/`
   - Use shadcn/ui components from `components/ui/`
   - Follow glassmorphism design patterns

4. **Protected Routes**:
   - Place in `app/(dashboard)/` for automatic auth protection
   - Use `requireAuth()` in Server Components
   - Check permissions with `hasPermission()`

### Code Quality Checks

Before committing:

```bash
# Run all quality checks
npm run validate

# Or individually:
npm run type-check  # TypeScript
npm run lint        # ESLint
npm run format      # Prettier
```

---

## Troubleshooting

### "Prisma Client not generated"

```bash
npm run prisma:generate
```

### "Database connection error"

1. Check `.env.local` has correct credentials
2. Verify Supabase project is active
3. Test connection in Prisma Studio: `npm run prisma:studio`

### "Auth not working"

1. Verify Supabase URL and anon key in `.env.local`
2. Check middleware.ts is configured correctly
3. Ensure RLS policies are applied in Supabase

### "Build errors"

```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

## Performance Tips

### Development

- Use `npm run dev --turbo` for faster rebuilds (experimental)
- Keep Prisma Studio closed when not in use
- Disable source maps in development if slow: `productionBrowserSourceMaps: false`

### Production

- Always run `npm run build` before deploying
- Enable caching in Vercel/deployment platform
- Use `prisma:migrate:prod` for production migrations
- Monitor database connection pool usage

---

## Next Steps

1. ✅ **Phase 1 Complete** - Foundation & Infrastructure
2. 📋 **Phase 2 Next** - Core Leave Management
   - Leave request forms
   - Approval workflow
   - Balance tracking
3. 📅 **Phase 3** - Team Calendar
4. 📄 **Phase 4** - Document Management
5. ⚙️ **Phase 5** - Admin Dashboard
6. 🎨 **Phase 6** - UX Polish
7. 🧪 **Phase 7** - Testing & Deployment

---

## Support

- **Documentation**: See README.md, SETUP.md, DEPLOYMENT.md
- **Project Plan**: See plan.md for complete roadmap
- **PRD**: See prd.md for product requirements

---

**Version**: 1.0.0
**Last Updated**: 2025-10-18
