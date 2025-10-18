# Quick Start: Prisma Accelerate Setup

## 🚀 5-Minute Setup

### 1️⃣ Get Your Direct Database URL

**From Supabase Dashboard:**
1. Go to https://app.supabase.com
2. Click **Settings** → **Database**
3. Find **Connection String** section
4. Select **Session mode**
5. Copy the URL (looks like `postgresql://postgres...`)

### 2️⃣ Update `.env.local`

Add this line to your `.env.local` file:

```env
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

Replace `[PASSWORD]` and `[PROJECT]` with your actual values.

### 3️⃣ Run These Commands

```bash
# Generate Prisma Client with Accelerate
npm run prisma:generate

# Apply migrations (if any)
npm run prisma:migrate

# Start the app
npm run dev
```

### 4️⃣ Verify It Works

If you see **no database errors** when visiting http://localhost:3000, you're all set! ✅

---

## ⚡ Your Current Setup

### Already Configured ✅
- ✅ `@prisma/extension-accelerate` installed
- ✅ `lib/prisma.ts` created with Accelerate
- ✅ `prisma/schema.prisma` updated with `directUrl`
- ✅ `DATABASE_URL` with Accelerate API key

### You Need to Add ❌
- ❌ `DIRECT_URL` in `.env.local`

---

## 📝 Example `.env.local`

```env
# Accelerate (You already have this)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGci..."

# Direct URL (Add this - get from Supabase)
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"

# Supabase (You already have these)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🆘 Troubleshooting

**Error: "directUrl is required"**
→ Add `DIRECT_URL` to `.env.local`

**Error: "Can't reach database server"**
→ Check your `DIRECT_URL` password and project ID

**Still having issues?**
→ See `PRISMA_ACCELERATE_SETUP.md` for detailed guide

---

## 📚 Full Documentation

- **Complete Guide**: `PRISMA_ACCELERATE_SETUP.md`
- **Setup Summary**: `PRISMA_SETUP_COMPLETE.md`
- **Project Architecture**: `CLAUDE.md`
