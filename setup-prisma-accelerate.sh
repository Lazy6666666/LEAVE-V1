#!/bin/bash

# Prisma Accelerate Setup Script
# This script helps you set up Prisma Accelerate for your Leave Management System

echo "🚀 Prisma Accelerate Setup"
echo "=========================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing @prisma/extension-accelerate..."
npm install @prisma/extension-accelerate

# Step 2: Check environment variables
echo ""
echo "✅ Step 2: Checking environment variables..."

if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from example..."
    cp .env.local.example .env.local
    echo "📝 Please edit .env.local with your credentials:"
    echo "   - DATABASE_URL (Prisma Accelerate URL)"
    echo "   - DIRECT_URL (Direct Supabase connection)"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

# Check for required environment variables
if ! grep -q "DATABASE_URL" .env.local || ! grep -q "DIRECT_URL" .env.local; then
    echo "❌ Missing required environment variables in .env.local"
    echo "   Required: DATABASE_URL, DIRECT_URL"
    echo "   See .env.local.example for reference"
    exit 1
fi

echo "✅ Environment variables found"

# Step 3: Generate Prisma Client
echo ""
echo "🔧 Step 3: Generating Prisma Client with Accelerate..."
npm run prisma:generate

# Step 4: Test connection
echo ""
echo "🔍 Step 4: Testing database connection..."
echo "You can now run: npm run dev"
echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Verify your .env.local has correct credentials"
echo "   2. Run: npm run prisma:migrate (for migrations)"
echo "   3. Run: npm run dev (to start the app)"
echo ""
echo "📖 See PRISMA_ACCELERATE_SETUP.md for detailed guide"
