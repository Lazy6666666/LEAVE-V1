const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'lib/services/document-access.ts');

console.log('🔧 Fixing document-access service Prisma imports...');

let content = fs.readFileSync(filePath, 'utf8');

// List of functions that need Prisma import
const functions = [
  'canDownloadDocument',
  'canEditDocument',
  'canDeleteDocument',
  'getDocumentAccessCheck',
  'validateAndLogAccess'
];

functions.forEach(funcName => {
  // Find the function and add Prisma import
  const regex = new RegExp(
    `(export async function ${funcName}\\([^)]+\\)\\s*{[^}]*{[^}]*try\\s*{)`,
    'gs'
  );

  content = content.replace(regex, '$1\n    // Import Prisma dynamically\n    const { prisma } = await import("@/lib/prisma");');
});

fs.writeFileSync(filePath, content);
console.log('✅ Fixed document-access service');