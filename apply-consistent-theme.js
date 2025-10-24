const fs = require('fs');
const path = require('path');

console.log('🎨 Applying consistent blue theme across all pages...');

// Fix dashboard page
const dashboardPath = path.join(__dirname, 'app', '(dashboard)', 'dashboard', 'page.tsx');
if (fs.existsSync(dashboardPath)) {
  let content = fs.readFileSync(dashboardPath, 'utf8');

  // Ensure consistent color usage in dashboard
  content = content.replace(
    /color: "bg-purple-500"/,
    'color: "bg-indigo-500"'
  );

  fs.writeFileSync(dashboardPath, content);
  console.log('✅ Updated dashboard theme');
}

// Fix leaves pages
const leavePages = [
  path.join(__dirname, 'app', '(dashboard)', 'leaves', 'page.tsx'),
  path.join(__dirname, 'app', '(dashboard)', 'leaves', 'new', 'page.tsx'),
  path.join(__dirname, 'app', '(dashboard)', 'calendar', 'page.tsx')
];

leavePages.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');

    // Replace any non-blue theme colors with consistent blue theme
    content = content.replace(/from-purple-/g, 'from-indigo-');
    content = content.replace(/to-purple-/g, 'to-blue-');
    content = content.replace(/text-purple-/g, 'text-blue-');
    content = content.replace(/border-purple-/g, 'border-blue-');
    content = content.replace(/bg-purple-/g, 'bg-blue-');
    content = content.replace(/hover:bg-purple-/g, 'hover:bg-blue-');
    content = content.replace(/ring-purple-/g, 'ring-blue-');
    content = content.replace(/focus:ring-purple-/g, 'focus:ring-blue-');

    fs.writeFileSync(pagePath, content);
    console.log(`✅ Updated theme for ${path.basename(pagePath)}`);
  }
});

// Fix notifications page
const notificationsPath = path.join(__dirname, 'app', '(dashboard)', 'notifications', 'page.tsx');
if (fs.existsSync(notificationsPath)) {
  let content = fs.readFileSync(notificationsPath, 'utf8');

  content = content.replace(/from-purple-/g, 'from-indigo-');
  content = content.replace(/to-purple-/g, 'to-blue-');
  content = content.replace(/text-purple-/g, 'text-blue-');
  content = content.replace(/bg-purple-/g, 'bg-blue-');

  fs.writeFileSync(notificationsPath, content);
  console.log('✅ Updated notifications theme');
}

// Fix profile page
const profilePath = path.join(__dirname, 'app', '(dashboard)', 'profile', 'page.tsx');
if (fs.existsSync(profilePath)) {
  let content = fs.readFileSync(profilePath, 'utf8');

  content = content.replace(/from-purple-/g, 'from-indigo-');
  content = content.replace(/to-purple-/g, 'to-blue-');
  content = content.replace(/text-purple-/g, 'text-blue-');
  content = content.replace(/bg-purple-/g, 'bg-blue-');

  fs.writeFileSync(profilePath, content);
  console.log('✅ Updated profile theme');
}

// Fix settings page
const settingsPath = path.join(__dirname, 'app', '(dashboard)', 'settings', 'page.tsx');
if (fs.existsSync(settingsPath)) {
  let content = fs.readFileSync(settingsPath, 'utf8');

  content = content.replace(/from-purple-/g, 'from-indigo-');
  content = content.replace(/to-purple-/g, 'to-blue-');
  content = content.replace(/text-purple-/g, 'text-blue-');
  content = content.replace(/bg-purple-/g, 'bg-blue-');

  fs.writeFileSync(settingsPath, content);
  console.log('✅ Updated settings theme');
}

// Fix admin pages
const adminPages = [
  path.join(__dirname, 'app', '(dashboard)', 'admin', 'page.tsx'),
  path.join(__dirname, 'app', '(dashboard)', 'admin', 'users', 'page.tsx'),
  path.join(__dirname, 'app', '(dashboard)', 'admin', 'leaves', 'page.tsx'),
  path.join(__dirname, 'app', '(dashboard)', 'admin', 'settings', 'page.tsx')
];

adminPages.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');

    content = content.replace(/from-purple-/g, 'from-indigo-');
    content = content.replace(/to-purple-/g, 'to-blue-');
    content = content.replace(/text-purple-/g, 'text-blue-');
    content = content.replace(/bg-purple-/g, 'bg-blue-');
    content = content.replace(/border-purple-/g, 'border-blue-');
    content = content.replace(/hover:bg-purple-/g, 'hover:bg-blue-');
    content = content.replace(/ring-purple-/g, 'ring-blue-');
    content = content.replace(/focus:ring-purple-/g, 'focus:ring-blue-');

    fs.writeFileSync(pagePath, content);
    console.log(`✅ Updated admin theme for ${path.basename(pagePath)}`);
  }
});

// Fix layout files
const layoutPath = path.join(__dirname, 'app', '(dashboard)', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  let content = fs.readFileSync(layoutPath, 'utf8');

  // Update navigation theme
  content = content.replace(/from-purple-/g, 'from-indigo-');
  content = content.replace(/to-purple-/g, 'to-blue-');
  content = content.replace(/text-purple-/g, 'text-blue-');
  content = content.replace(/bg-purple-/g, 'bg-blue-');
  content = content.replace(/border-purple-/g, 'border-blue-');
  content = content.replace(/hover:bg-purple-/g, 'hover:bg-blue-');

  fs.writeFileSync(layoutPath, content);
  console.log('✅ Updated dashboard layout theme');
}

console.log('✨ Consistent blue theme applied across all pages!');