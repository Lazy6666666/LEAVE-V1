const fs = require('fs');
const path = require('path');

// List of API routes that need fixing
const apiRoutes = [
  'app/api/notifications/route.ts',
  'app/api/documents/[id]/route.ts',
  'app/api/search/route.ts',
  'app/api/leave-types/route.ts',
  'app/api/documents/[id]/download/route.ts',
  'app/api/notifications/read-all/route.ts',
  'app/api/notifications/[id]/read/route.ts',
  'app/api/leaves/[id]/cancel/route.ts',
  'app/api/leaves/[id]/approve/route.ts',
  'app/api/leaves/[id]/reject/route.ts',
  'app/api/calendar/conflicts/route.ts',
  'app/api/documents/expiry/route.ts'
];

console.log('🔧 Fixing Prisma imports in API routes...\n');

apiRoutes.forEach(route => {
  const filePath = path.join(__dirname, '..', route);

  if (fs.existsSync(filePath)) {
    console.log(`Processing: ${route}`);

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if it has Prisma import
    if (content.includes('import { prisma }') || content.includes('import * as prisma') || content.includes('import prisma from')) {
      // Remove static Prisma import
      content = content.replace(/import\s*{\s*prisma\s*}\s*from\s*["']@\/lib\/prisma["'];?\s*/g, '');
      content = content.replace(/import\s*\*\s*as\s*prisma\s*from\s*["']@\/lib\/prisma["'];?\s*/g, '');
      content = content.replace(/import\s+prisma\s+from\s*["']@\/lib\/prisma["'];?\s*/g, '');

      // Add dynamic export if not already present
      if (!content.includes('export const dynamic')) {
        content = content.replace(/(export\s+async\s+function\s+\w+|export\s+async\s+function)/, '// Force dynamic rendering\nexport const dynamic = \'force-dynamic\';\n\n$1');
      }

      // Find the first async function and add dynamic Prisma import
      const functionMatch = content.match(/export\s+async\s+function\s+(\w+)/);
      if (functionMatch) {
        const functionName = functionMatch[1];
        const functionStart = content.indexOf(functionMatch[0]);
        const openingBrace = content.indexOf('{', functionStart);

        // Insert Prisma import after the opening brace of the function
        if (openingBrace !== -1) {
          const insertPosition = content.indexOf('\n', openingBrace) + 1;
          const beforeImport = content.substring(0, insertPosition);
          const afterImport = content.substring(insertPosition);

          content = beforeImport +
            '    // Import Prisma dynamically\n' +
            '    const { prisma } = await import("@/lib/prisma");\n\n' +
            afterImport;
        }
      }

      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed ${route}`);
    } else {
      console.log(`  ⚪ No Prisma import found in ${route}`);
    }
  } else {
    console.log(`  ❌ File not found: ${route}`);
  }
});

console.log('\n✨ All API routes have been processed!');