const fs = require('fs');
const path = require('path');

// List of files with syntax errors
const filesToFix = [
  'app/api/documents/[id]/route.ts',
  'app/api/leaves/[id]/approve/route.ts',
  'app/api/leaves/[id]/cancel/route.ts',
  'app/api/leaves/[id]/reject/route.ts',
  'app/api/notifications/[id]/read/route.ts',
  'app/api/notifications/read-all/route.ts'
];

console.log('🔧 Fixing syntax errors in API routes...\n');

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, '..', file);

  if (fs.existsSync(filePath)) {
    console.log(`Processing: ${file}`);
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix syntax error where import is inside function parameters
    content = content.replace(
      /export async function (\w+)\s*\(\s*([^)]+)\s*\/\/ Import Prisma dynamically\s*const\s*{\s*prisma\s*}\s*=\s*await\s*import\(["']@\/lib\/prisma["']\);\s*\)\s*{/gs,
      'export async function $1(\n    $2\n) {\n  // Import Prisma dynamically\n  const { prisma } = await import("@/lib/prisma");'
    );

    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed ${file}`);
  } else {
    console.log(`  ❌ File not found: ${file}`);
  }
});

console.log('\n✨ Syntax errors have been fixed!');