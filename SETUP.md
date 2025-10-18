# Setup Guide for Leave Management System

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project name**: leave-management (or your choice)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is sufficient

4. Wait for project to be created (~2 minutes)

## Step 2: Get Supabase Credentials

1. In your Supabase project, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

3. Go to **Settings** > **Database**
4. Scroll to **Connection String**
5. Select **Transaction** mode
6. Copy the connection string (it will have `[YOUR-PASSWORD]` placeholder)

## Step 3: Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```env
# Replace these with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Replace [YOUR-PASSWORD] with your database password
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:6543/postgres?pgbouncer=true
DIRECT_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Run Database Migrations

Once you've configured the environment variables, run:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Seed the database with initial data
npx prisma db seed
```

## Step 5: Verify Setup

1. Go to your Supabase dashboard
2. Click on **Table Editor**
3. You should see all the tables created:
   - users
   - profiles
   - leave_types
   - leaves
   - leave_balances
   - company_documents
   - notification_logs
   - audit_logs
   - company_settings

## Step 6: Enable Row Level Security (RLS)

After migrations, run the RLS setup (instructions provided separately).

## Step 7: Start Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000`

## Default Admin Credentials

After seeding, you can login with:

- **Email**: admin@company.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change this password immediately in production!

## Troubleshooting

### "Invalid database URL"

- Check that you replaced `[YOUR-PASSWORD]` with your actual database password
- Ensure the project URL matches your Supabase project

### "Connection timeout"

- Your IP might be blocked by Supabase firewall
- Go to Supabase **Settings** > **Database** > **Connection pooling**
- Enable "Allow connections from anywhere" (for development)

### "Migration failed"

- Delete the `prisma/migrations` folder
- Run `npx prisma migrate dev --name init` again

### Tables not appearing in Supabase

- Check that you're using the correct database URL
- Verify you're looking at the correct project in Supabase dashboard
- Check the SQL Editor for any error messages

## Next Steps

After setup is complete:

1. Configure email templates in Supabase (optional)
2. Set up storage buckets for document uploads
3. Configure authentication providers if needed
4. Review and customize leave types
5. Add your company's employees

## Support

For issues or questions, check:

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
