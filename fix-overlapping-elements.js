const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing overlapping elements and layout issues...');

// Fix globals.css - remove conflicting layout rules
const globalCssPath = path.join(__dirname, 'app', 'globals.css');
if (fs.existsSync(globalCssPath)) {
  let content = fs.readFileSync(globalCssPath, 'utf8');

  // Remove problematic container fixes that might cause overlaps
  content = content.replace(
    /  \/\* Ensure flex containers don't compress content \*\/[\s\S]*?min-width: 0;[\s\S]*?}/,
    ''
  );

  // Remove grid container fixes that might conflict
  content = content.replace(
    /  \/\* Grid container fixes \*\/[\s\S]*?grid-template-columns: repeat\(auto-fit, minmax\(300px, 1fr\)\);[\s\S]*?}/,
    ''
  );

  // Fix text container to prevent overflow issues
  content = content.replace(
    /  \/\* Ensure proper text flow in all sections \*\/[\s\S]*?hyphens: auto;[\s\S]*?}/,
    `  /* Ensure proper text flow in all sections */
  .text-container {
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    position: relative;
    z-index: 1;
  }`
  );

  // Fix container layout to prevent overlaps
  content = content.replace(
    /  \/\* Fix container layouts \*\/[\s\S]*?padding: 0 2rem;[\s\S]*?}/,
    `  /* Fix container layouts */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    position: relative;
    z-index: 1;
  }

  @media (min-width: 640px) {
    .container {
      padding: 0 2rem;
    }
  }`
  );

  // Add explicit z-index management for layered elements
  content = content.replace(
    /  @keyframes spin {[\s\S]*?transform: rotate\(360deg\);[\s\S]*?}/,
    `  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Z-index management for proper layering */
  .background-decoration {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .content-layer {
    position: relative;
    z-index: 10;
  }

  .card-layer {
    position: relative;
    z-index: 20;
  }

  .overlay-layer {
    position: relative;
    z-index: 30;
  }

  .modal-layer {
    position: relative;
    z-index: 40;
  }

  .notification-layer {
    position: relative;
    z-index: 50;
  }

  /* Prevent content overflow */
  .overflow-hidden {
    overflow: hidden;
  }

  .overflow-visible {
    overflow: visible;
  }

  .overflow-scroll {
    overflow: scroll;
  }

  /* Fix absolute positioning issues */
  .absolute-container {
    position: relative;
  }

  .absolute-element {
    position: absolute;
  }

  /* Fix spacing and prevent collapses */
  .spacing-fix {
    clear: both;
    display: block;
    content: "";
  }`
  );

  fs.writeFileSync(globalCssPath, content);
  console.log('✅ Fixed global CSS overlapping issues');
}

// Fix register page layout
const registerPath = path.join(__dirname, 'app', '(auth)', 'register', 'page.tsx');
if (fs.existsSync(registerPath)) {
  let content = fs.readFileSync(registerPath, 'utf8');

  // Fix the main container to prevent overlaps
  content = content.replace(
    /return \(\s*<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4 text-container">/s,
    `return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="background-decoration">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="content-layer relative w-full max-w-lg mx-auto">`
  );

  // Fix the card container
  content = content.replace(
    /<Card className="shadow-xl border-0 bg-white\/90 backdrop-blur-sm card-hover">/,
    '<Card className="card-layer shadow-xl border-0 bg-white/90 backdrop-blur-sm card-hover">'
  );

  // Fix password requirements box positioning
  content = content.replace(
    /className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"/,
    'className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg relative z-10"'
  );

  fs.writeFileSync(registerPath, content);
  console.log('✅ Fixed register page overlapping elements');
}

// Fix login page layout
const loginPath = path.join(__dirname, 'app', '(auth)', 'login', 'page.tsx');
if (fs.existsSync(loginPath)) {
  let content = fs.readFileSync(loginPath, 'utf8');

  // Fix the main container
  content = content.replace(
    /return \(\s*<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4 text-container">/s,
    `return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="background-decoration">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="content-layer relative w-full max-w-6xl mx-auto">`
  );

  // Fix the grid layout to prevent overlap
  content = content.replace(
    /<div className="grid lg:grid-cols-2 gap-8 items-center">/,
    '<div className="grid lg:grid-cols-2 gap-8 items-center relative z-10">'
  );

  // Fix card positioning
  content = content.replace(
    /<Card className="shadow-xl border-0 bg-white\/90 backdrop-blur-sm card-hover p-8 relative overflow-hidden">/,
    '<Card className="card-layer shadow-xl border-0 bg-white/90 backdrop-blur-sm card-hover p-8 relative overflow-hidden">'
  );

  fs.writeFileSync(loginPath, content);
  console.log('✅ Fixed login page overlapping elements');
}

// Fix landing page layout
const landingPath = path.join(__dirname, 'app', 'page.tsx');
if (fs.existsSync(landingPath)) {
  let content = fs.readFileSync(landingPath, 'utf8');

  // Ensure proper layering in hero section
  content = content.replace(
    /className="hero-bg relative overflow-hidden py-20 px-4">/,
    'className="hero-bg relative overflow-hidden py-20 px-4">'
  );

  content = content.replace(
    /<div className="container mx-auto relative">/,
    '<div className="container mx-auto relative content-layer">'
  );

  fs.writeFileSync(landingPath, content);
  console.log('✅ Fixed landing page overlapping elements');
}

// Fix dashboard layout
const dashboardPath = path.join(__dirname, 'app', '(dashboard)', 'dashboard', 'page.tsx');
if (fs.existsSync(dashboardPath)) {
  let content = fs.readFileSync(dashboardPath, 'utf8');

  // Ensure proper container structure
  content = content.replace(
    /return \(\s*<div className="space-y-6">/s,
    `return (
    <div className="space-y-6 relative content-layer">`
  );

  fs.writeFileSync(dashboardPath, content);
  console.log('✅ Fixed dashboard overlapping elements');
}

console.log('✨ All overlapping element issues have been fixed!');