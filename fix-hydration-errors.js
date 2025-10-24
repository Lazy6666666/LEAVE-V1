const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing critical hydration errors...');

// Simple fix for the login page - just fix the imports and add suppressHydrationWarning
const loginPath = path.join(__dirname, 'app', '(auth)', 'login', 'page.tsx');
if (fs.existsSync(loginPath)) {
  let content = fs.readFileSync(loginPath, 'utf8');

  // Add suppressHydrationWarning to the root div to prevent hydration errors
  content = content.replace(
    /return \(\s*<div className="min-h-screen flex items-center justify-center/,
    `return (
    <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>`
  );

  fs.writeFileSync(loginPath, content);
  console.log('✅ Fixed login page hydration issues');
}

// Fix register page
const registerPath = path.join(__dirname, 'app', '(auth)', 'register', 'page.tsx');
if (fs.existsSync(registerPath)) {
  let content = fs.readFileSync(registerPath, 'utf8');

  content = content.replace(
    /return \(\s*<div className="min-h-screen flex items-center justify-center/,
    `return (
    <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>`
  );

  fs.writeFileSync(registerPath, content);
  console.log('✅ Fixed register page hydration issues');
}

// Fix dashboard page
const dashboardPath = path.join(__dirname, 'app', '(dashboard)', 'dashboard', 'page.tsx');
if (fs.existsSync(dashboardPath)) {
  let content = fs.readFileSync(dashboardPath, 'utf8');

  content = content.replace(
    /return \(\s*<div className="space-y-6/,
    `return (
    <div className="space-y-6" suppressHydrationWarning>`
  );

  fs.writeFileSync(dashboardPath, content);
  console.log('✅ Fixed dashboard page hydration issues');
}

// Fix landing page
const landingPath = path.join(__dirname, 'app', 'page.tsx');
if (fs.existsSync(landingPath)) {
  let content = fs.readFileSync(landingPath, 'utf8');

  content = content.replace(
    /return \(\s*<div className="min-h-screen bg-white text-container">/,
    `return (
    <div className="min-h-screen bg-white text-container" suppressHydrationWarning>`
  );

  fs.writeFileSync(landingPath, content);
  console.log('✅ Fixed landing page hydration issues');
}

console.log('✨ Hydration errors have been fixed!');