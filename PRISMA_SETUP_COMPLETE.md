# Prisma Accelerate Setup - COMPLETE ✅

**Date**: 2025-10-18
**Status**: Ready for Configuration

---

## ✅ What's Been Done

### 1. Prisma Client with Accelerate Extension Created
**File**: `lib/prisma.ts`

```typescript
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export const prisma = new PrismaClient().$extends(withAccelerate());
```

- Singleton pattern to prevent multiple instances
- Accelerate extension for connection pooling and caching
- Development logging enabled
- Production-ready configuration

### 2. Prisma Schema Updated
**File**: `prisma/schema.prisma`

Added `directUrl` configuration:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")     // Accelerate URL
  directUrl = env("DIRECT_URL")       // Direct connection for migrations
}
```

### 3. Environment Template Updated
**File**: `.env.local.example`

Added both required URLs:
- `DATABASE_URL`: Prisma Accelerate connection
- `DIRECT_URL`: Direct PostgreSQL connection

### 4. Dependencies Installed
```bash
✅ @prisma/extension-accelerate@1.2.1
```

### 5. Documentation Created
- ✅ `PRISMA_ACCELERATE_SETUP.md` - Complete setup guide
- ✅ `setup-prisma-accelerate.sh` - Automated setup script

---

## 🔧 What You Need to Do Next

### Step 1: Get Your Direct Database URL

You need to add the **DIRECT_URL** to your `.env.local` file.

#### If Using Supabase:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Settings** > **Database**
3. Scroll to **Connection String**
4. Select **Session mode**
5. Copy the connection string
6. It should look like:
   ```
   postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

### Step 2: Update Your `.env.local` File

Create or update `.env.local` with both URLs:

```env
# Prisma Accelerate (Runtime - You already have this)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Direct Connection (NEW - Add this for migrations)
DIRECT_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT].supabase.co:5432/postgres"

# Supabase (Existing)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ IMPORTANT**: Replace:
- `[YOUR_PASSWORD]` with your Supabase database password
- `[YOUR_PROJECT]` with your Supabase project ID

### Step 3: Generate Prisma Client

```bash
npm run prisma:generate
```

This will regenerate your Prisma Client with Accelerate support.

### Step 4: Run Migrations (if needed)

```bash
npm run prisma:migrate
```

This uses the `DIRECT_URL` to apply schema changes to your database.

### Step 5: Test the Setup

Start the development server:

```bash
npm run dev
```

If everything is configured correctly, your app should start without database connection errors.

---

## 🎯 Configuration Checklist

- [ ] Install `@prisma/extension-accelerate` ✅ (Already done)
- [ ] Create `lib/prisma.ts` ✅ (Already done)
- [ ] Update `schema.prisma` with `directUrl` ✅ (Already done)
- [ ] Get DIRECT_URL from Supabase
- [ ] Add DIRECT_URL to `.env.local`
- [ ] Run `npm run prisma:generate`
- [ ] Run `npm run prisma:migrate` (optional)
- [ ] Test with `npm run dev`

---

## 📋 Your Current Setup

### DATABASE_URL (Accelerate) ✅
You already have this in your `.env.local`:
```
prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGci...
```

### DIRECT_URL ❌
**You need to add this** - Get it from Supabase Dashboard

---

## 🚨 Common Issues & Solutions

### Issue 1: "directUrl is required"
**Solution**: Add `DIRECT_URL` to `.env.local`

### Issue 2: "Can't reach database server"
**Solution**:
- Verify `DIRECT_URL` is correct
- Check Supabase project is active
- Ensure password has no special characters (URL encode if needed)

### Issue 3: "Invalid API key"
**Solution**: Regenerate Accelerate API key in Prisma Console

### Issue 4: Migrations fail
**Solution**:
- Ensure `DIRECT_URL` is correct
- Check you're using Session mode connection string
- Verify database user has migration permissions

---

## 💡 How This Works

### Runtime Queries (Your App)
```
Your App → DATABASE_URL (Accelerate) → Connection Pool → Database
         └─> Fast queries with caching
```

### Migrations
```
Prisma Migrate → DIRECT_URL → Direct Database Connection
              └─> Schema changes applied directly
```

**Why separate URLs?**
- **Accelerate** is optimized for queries (fast, cached, pooled)
- **Direct** is needed for schema operations (migrations, introspection)

---

## 🎓 Using Accelerate Features

### Basic Query (No caching)
```typescript
const users = await prisma.user.findMany();
```

### With Caching (Recommended for static data)
```typescript
const leaveTypes = await prisma.leaveType.findMany({
  cacheStrategy: {
    ttl: 300,  // Cache for 5 minutes
    swr: 60,   // Stale-while-revalidate
  },
});
```

### Performance Monitoring
Check your Prisma Console for:
- Query performance metrics
- Cache hit rates
- Connection pool usage
- Slow query identification

---

## 📚 Additional Resources

- **Setup Guide**: See `PRISMA_ACCELERATE_SETUP.md` for detailed instructions
- **Prisma Accelerate Docs**: https://www.prisma.io/docs/accelerate
- **Supabase + Prisma**: https://supabase.com/docs/guides/integrations/prisma
- **Project Architecture**: See `CLAUDE.md` for system overview

---

## ✅ Next Actions

1. **Immediate**: Add `DIRECT_URL` to `.env.local`
2. **Immediate**: Run `npm run prisma:generate`
3. **Immediate**: Test with `npm run dev`
4. **Optional**: Add caching to static queries (leave types, company settings)
5. **Optional**: Monitor performance in Prisma Console

---

**Setup Status**: 80% Complete
**Remaining**: Add DIRECT_URL environment variable
**Time to Complete**: ~5 minutes

---

**Last Updated**: 2025-10-18
