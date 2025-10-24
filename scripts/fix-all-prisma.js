const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all remaining Prisma imports...');

// List of services that need fixing
const services = [
  {
    file: 'lib/services/document-expiry.ts',
    functions: [
      'getExpiringDocuments',
      'getExpiredDocuments',
      'getDocumentsByExpiryStatus',
      'sendExpiryNotification',
      'checkAndNotifyExpiringDocuments'
    ]
  }
];

services.forEach(service => {
  const filePath = path.join(__dirname, '..', service.file);

  if (fs.existsSync(filePath)) {
    console.log(`Processing: ${service.file}`);
    let content = fs.readFileSync(filePath, 'utf8');

    service.functions.forEach(funcName => {
      // Find each function and add dynamic Prisma import
      const regex = new RegExp(
        `(export async function ${funcName}\\([^)]*\\)\\s*{[^}]*try\\s*{)`,
        'gs'
      );

      content = content.replace(regex, '$1\n    // Import Prisma dynamically\n    const { prisma } = await import("@/lib/prisma");');
    });

    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed ${service.file}`);
  } else {
    console.log(`  ❌ File not found: ${service.file}`);
  }
});

console.log('\n✨ All services have been fixed!');