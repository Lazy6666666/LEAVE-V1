const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing login page layout and theme...');

const filePath = path.join(__dirname, 'app', '(auth)', 'login', 'page.tsx');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the background gradient to match landing page blue theme
  content = content.replace(
    /className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900\/20 to-slate-900 p-4 relative overflow-hidden"/,
    'className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4 text-container"'
  );

  // Update logo and branding colors
  content = content.replace(
    /className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center"/,
    'className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl flex items-center justify-center"'
  );

  // Fix welcome text colors
  content = content.replace(
    /className="text-3xl lg:text-4xl font-bold text-white"/,
    'className="text-3xl lg:text-4xl font-bold text-gray-900"'
  );

  content = content.replace(
    /className="text-4xl lg:text-5xl font-bold text-gradient mb-4"/,
    'className="text-4xl lg:text-5xl font-bold text-gradient-primary mb-4"'
  );

  content = content.replace(
    /className="text-xl text-gray-300 max-w-lg"/,
    'className="text-xl text-gray-600 max-w-lg"'
  );

  // Fix card styling
  content = content.replace(
    /className="glass-card-enhanced p-8 relative overflow-hidden"/,
    'className="shadow-xl border-0 bg-white/90 backdrop-blur-sm card-hover p-8 relative overflow-hidden"'
  );

  // Fix card header colors
  content = content.replace(
    /className="text-2xl font-bold text-center text-white"/,
    'className="text-2xl font-bold text-center text-gray-900"'
  );

  content = content.replace(
    /className="text-center text-gray-300"/,
    'className="text-center text-gray-600"'
  );

  // Fix form labels
  content = content.replace(
    /className="text-sm font-medium text-gray-200 flex items-center gap-2"/g,
    'className="text-sm font-medium text-gray-700 flex items-center gap-2"'
  );

  // Fix form input classes
  content = content.replace(
    /className="modern-input text-white placeholder-gray-400"/g,
    'className="form-input"'
  );

  content = content.replace(
    /className="modern-input pr-12 text-white placeholder-gray-400"/g,
    'className="form-input pr-12"'
  );

  // Fix error text colors
  content = content.replace(
    /className="text-sm text-red-400 flex items-center gap-1"/g,
    'className="text-sm text-red-600 flex items-center gap-1"'
  );

  // Fix checkbox label
  content = content.replace(
    /className="text-sm font-normal text-gray-300 cursor-pointer"/,
    'className="text-sm font-normal text-gray-700 cursor-pointer"'
  );

  // Fix demo credentials text
  content = content.replace(
    /className="mt-6 p-4 glass-card text-center"/,
    'className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center"'
  );

  content = content.replace(
    /className="text-sm text-gray-300"/,
    'className="text-sm text-blue-700"'
  );

  content = content.replace(
    /className="text-white"/g,
    'className="text-gray-900"'
  );

  // Fix button class
  content = content.replace(
    /className="btn-primary w-full h-12 text-base font-semibold relative group"/,
    'className="w-full h-12 text-base font-medium btn-hover-primary"'
  );

  // Fix feature section colors
  content = content.replace(
    /className="flex items-center gap-3 text-gray-300"/g,
    'className="flex items-center gap-3 text-gray-600"'
  );

  content = content.replace(
    /className="text-sm text-gray-400"/g,
    'className="text-sm text-gray-500"'
  );

  // Remove complex animations and dark background elements
  content = content.replace(
    /{\/\* Enhanced background with animated gradient \*\/[\s\S]*?<\/div>/,
    '{/* Background decoration */}\n      <div className="absolute inset-0 overflow-hidden">\n        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>\n        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>\n      </div>'
  );

  // Remove blob animation styles
  content = content.replace(
    /{\/\* Blob animation styles \*\/[\s\S]*?<\/style>/,
    ''
  );

  // Update character colors to blue theme
  content = content.replace(
    /className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600"/,
    'className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600"'
  );

  // Update feature icon backgrounds
  content = content.replace(
    /className="w-10 h-10 bg-blue-500\/20 rounded-lg flex items-center justify-center"/,
    'className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"'
  );

  content = content.replace(
    /className="w-5 h-5 text-blue-400"/g,
    'className="w-5 h-5 text-blue-600"'
  );

  content = content.replace(
    /className="w-10 h-10 bg-purple-500\/20 rounded-lg flex items-center justify-center"/,
    'className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"'
  );

  content = content.replace(
    /className="w-5 h-5 text-purple-400"/,
    'className="w-5 h-5 text-indigo-600"'
  );

  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed login page layout and theme');
} else {
  console.log('❌ Login page file not found');
}

console.log('✨ Login page styling fixed!');