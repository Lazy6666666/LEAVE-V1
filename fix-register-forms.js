const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing register page form styling...');

const filePath = path.join(__dirname, 'app', '(auth)', 'register', 'page.tsx');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix all Input elements to use form-input class
  content = content.replace(/className="h-11"/g, 'className="form-input"');
  content = content.replace(/className="h-11 pr-10"/g, 'className="form-input pr-10"');

  // Fix select elements
  content = content.replace(
    /className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"/g,
    'className="form-input"'
  );

  // Fix the submit button
  content = content.replace(
    /className="w-full h-11 text-base font-medium"/g,
    'className="w-full h-12 text-base font-medium btn-hover-primary"'
  );

  // Fix the password requirements box
  content = content.replace(
    /bg-amber-50 border border-amber-200 rounded-lg/g,
    'bg-blue-50 border border-blue-200 rounded-lg'
  );
  content = content.replace(
    /text-amber-800 mb-2/g,
    'text-blue-800 mb-2'
  );
  content = content.replace(
    /text-xs text-amber-700/g,
    'text-xs text-blue-700'
  );

  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed register page form styling');
} else {
  console.log('❌ Register page file not found');
}

console.log('✨ Register page styling fixed!');