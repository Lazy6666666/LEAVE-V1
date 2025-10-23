# Prisma Accelerate Setup Guide

This guide explains how to properly configure Prisma Accelerate for your Leave Management System.

---

## What is Prisma Accelerate?

Prisma Accelerate is a global database cache with scalable connection pooling built into Prisma Client. It provides:

- **Connection Pooling**: Efficient database connection management
- **Global Caching**: Edge-ready caching for faster queries
- **Query Acceleration**: Optimized query performance

---

## Setup Steps

### 1. Install Required Dependencies

```bash
npm install @prisma/extension-accelerate
```

### 2. Environment Variables Setup

You need **TWO** database URLs in your `.env` file:

```env
# Prisma Accelerate URL (for application runtime)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# Direct Database URL (for migrations and schema operations)
DIRECT_URL="postgresql://user:password@host:5432/database"
```

**Why two URLs?**

- `DATABASE_URL`: Used by your application at runtime (with Accelerate)
- `DIRECT_URL`: Used for Prisma migrations, introspection, and db push

---

### 3. Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Add this line
}
```

---

### 4. Prisma Client Configuration (Already Done ✅)

The `lib/prisma.ts` file has been created with Accelerate extension:

```typescript
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export const prisma = new PrismaClient().$extends(withAccelerate());
```

---

## Getting Your Database URLs

### Option 1: Using Supabase with Accelerate

If you're using Supabase, you need both URLs:

**DATABASE_URL (Accelerate):**

- This is your Prisma Accelerate URL
- Format: `prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY`
- You already have this

**DIRECT_URL (Supabase):**

1. Go to Supabase Dashboard → Settings → Database
2. Copy the **Connection String** in **Session Mode**
3. Format: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`

### Option 2: Generate Accelerate URL

If you don't have an Accelerate URL yet:

1. Go to [Prisma Data Platform](https://console.prisma.io/)
2. Create a new project
3. Enable Accelerate
4. Connect your database
5. Copy the generated Accelerate URL

---

## Complete Environment Variables

Your `.env` or `.env.local` should contain:

```env
# Prisma Accelerate (Runtime)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# Direct Connection (Migrations)
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Supabase (for Auth and Storage)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Running Database Operations

### Migrations

```bash
# Create and apply migration (uses DIRECT_URL)
npm run prisma:migrate

# Generate Prisma Client (uses DATABASE_URL)
npm run prisma:generate
```

### Development Database Push

```bash
# Push schema changes (uses DIRECT_URL)
npm run db:push
```

### Prisma Studio

```bash
# Open database GUI (uses DIRECT_URL)
npm run prisma:studio
```

---

## Verifying Setup

### 1. Check Environment Variables

```bash
# On Windows (PowerShell)
$env:DATABASE_URL
$env:DIRECT_URL

# On Linux/Mac
echo $DATABASE_URL
echo $DIRECT_URL
```

### 2. Test Prisma Client

Create a test file `test-db.ts`:

```typescript
import { prisma } from "./lib/prisma";

async function testConnection() {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    console.log("✅ Database connection successful!");
    console.log("Users:", users);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

Run it:

```bash
npx tsx test-db.ts
```

### 3. Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

---

## Caching with Accelerate

Prisma Accelerate supports query caching:

```typescript
// Cache for 60 seconds
const users = await prisma.user.findMany({
  cacheStrategy: {
    ttl: 60,
    swr: 10,
  },
});
```

---

## Troubleshooting

### Error: "Can't reach database server"

**Solution**: Check your `DIRECT_URL` is correct for migrations.

### Error: "Invalid API key"

**Solution**: Regenerate your Accelerate API key in Prisma Console.

### Error: "directUrl is required"

**Solution**: Add `directUrl = env("DIRECT_URL")` to your `schema.prisma`.

### Slow Queries

**Solution**: Accelerate provides query insights in the Prisma Console.

### Connection Pool Exhausted

**Solution**: Accelerate handles pooling automatically, but check your concurrent connections.

---

## Performance Tips

### 1. Use Caching Strategically

```typescript
// Static data (cache longer)
const leaveTypes = await prisma.leaveType.findMany({
  cacheStrategy: { ttl: 300 }, // 5 minutes
});

// Dynamic data (cache shorter)
const leaves = await prisma.leave.findMany({
  cacheStrategy: { ttl: 30 }, // 30 seconds
});
```

### 2. Monitor Performance

- Use Prisma Studio Insights
- Check Accelerate Console for query performance
- Monitor cache hit rates

### 3. Optimize Queries

```typescript
// Use select to fetch only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    profile: {
      select: {
        full_name: true,
      },
    },
  },
});
```

---

## Security Notes

1. **Never commit** `.env` files to git
2. **Rotate API keys** regularly in production
3. **Use separate** Accelerate projects for dev/staging/prod
4. **Monitor** unusual query patterns in Accelerate Console

---

## Next Steps

1. ✅ Install `@prisma/extension-accelerate`
2. ✅ Update `.env` with both DATABASE_URL and DIRECT_URL
3. ✅ Add `directUrl` to `schema.prisma`
4. ✅ Run `prisma generate`
5. ✅ Test connection
6. ✅ Run migrations
7. ✅ Start development server

---

## Additional Resources

- [Prisma Accelerate Docs](https://www.prisma.io/docs/accelerate)
- [Supabase + Prisma Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Caching Strategies](https://www.prisma.io/docs/accelerate/caching)

---

**Status**: Setup guide complete
**Next**: Install dependencies and configure environment variables
