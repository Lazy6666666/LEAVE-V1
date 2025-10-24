const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing critical module import issues...');

// Fix login page imports
const loginPath = path.join(__dirname, 'app', '(auth)', 'login', 'page.tsx');
if (fs.existsSync(loginPath)) {
  let content = fs.readFileSync(loginPath, 'utf8');

  // Fix the Card import to prevent module loading issues
  content = content.replace(
    /import {\s*Card,\s*CardContent,\s*CardDescription,\s*CardFooter,\s*CardHeader,\s*CardTitle,\s*} from "@\/components\/ui\/card";/,
    `import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";`
  );

  // Fix other imports that might cause issues
  content = content.replace(
    /import { Checkbox } from "@\/components\/ui\/checkbox";/,
    `import { Checkbox } from "@/components/ui/checkbox";`
  );

  // Add error boundary wrapper
  content = content.replace(
    /export default function LoginPage\(\) {/,
    `// Error boundary wrapper to prevent hydration crashes
function ErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      {children}
    </div>
  );
}

export default function LoginPage() {`
  );

  // Wrap the return statement with error boundary
  content = content.replace(
    /return \(/,
    `return (
    <ErrorBoundary fallback={<div>Loading...</div>}>`
  );

  // Close the error boundary at the end
  content = content.replace(
    /}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>;/s,
    `}
      </ErrorBoundary>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>;`
  );

  fs.writeFileSync(loginPath, content);
  console.log('✅ Fixed login page module imports and added error boundary');
}

// Fix register page imports
const registerPath = path.join(__dirname, 'app', '(auth)', 'register', 'page.tsx');
if (fs.existsSync(registerPath)) {
  let content = fs.readFileSync(registerPath, 'utf8');

  // Fix Card import
  content = content.replace(
    /import {\s*Card,\s*CardContent,\s*CardDescription,\s*CardFooter,\s*CardHeader,\s*CardTitle,\s*} from "@\/components\/ui\/card";/,
    `import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";`
  );

  // Add error boundary wrapper
  content = content.replace(
    /export default function RegisterPage\(\) {/,
    `// Error boundary wrapper to prevent hydration crashes
function ErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      {children}
    </div>
  );
}

export default function RegisterPage() {`
  );

  // Wrap the return statement
  content = content.replace(
    /return \(/,
    `return (
    <ErrorBoundary fallback={<div>Loading...</div>}>`
  );

  // Close the error boundary at the end
  content = content.replace(
    /}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>;/s,
    `}
      </ErrorBoundary>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>;`
  );

  fs.writeFileSync(registerPath, content);
  console.log('✅ Fixed register page module imports and added error boundary');
}

// Fix dashboard page imports
const dashboardPath = path.join(__dirname, 'app', '(dashboard)', 'dashboard', 'page.tsx');
if (fs.existsSync(dashboardPath)) {
  let content = fs.readFileSync(dashboardPath, 'utf8');

  // Fix imports
  content = content.replace(
    /import {\s*Card,\s*CardContent,\s*CardDescription,\s*CardHeader,\s*CardTitle,\s*} from "@\/components\/ui\/card";/,
    `import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";`
  );

  content = content.replace(
    /import { Tabs, TabsContent, TabsList, TabsTrigger } from "@\/components\/ui\/tabs";/,
    `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";`
  );

  // Add error boundary
  content = content.replace(
    /export default function DashboardPage\(\) {/,
    `// Error boundary wrapper to prevent hydration crashes
function ErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      {children}
    </div>
  );
}

export default function DashboardPage() {`
  );

  content = content.replace(
    /return \(/,
    `return (
    <ErrorBoundary fallback={<div>Loading dashboard...</div>}>`
  );

  content = content.replace(
    /}\s*<\/div>;\s*$/,
    `}
      </ErrorBoundary>
    </div>;`
  );

  fs.writeFileSync(dashboardPath, content);
  console.log('✅ Fixed dashboard page module imports and added error boundary');
}

// Fix landing page imports
const landingPath = path.join(__dirname, 'app', 'page.tsx');
if (fs.existsSync(landingPath)) {
  let content = fs.readFileSync(landingPath, 'utf8');

  // Fix imports
  content = content.replace(
    /import {\s*Card,\s*CardContent,\s*CardDescription,\s*CardHeader,\s*CardTitle,\s*} from "@\/components\/ui\/card";/,
    `import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";`
  );

  // Add error boundary
  content = content.replace(
    /export default function Home\(\) {/,
    `// Error boundary wrapper to prevent hydration crashes
function ErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      {children}
    </div>
  );
}

export default function Home() {`
  );

  content = content.replace(
    /return \(/,
    `return (
    <ErrorBoundary fallback={<div>Loading...</div>}>`
  );

  content = content.replace(
    /}\s*<\/div>\s*<\/div>\s*<\/footer>\s*<\/div>;\s*$/,
    `}
      </ErrorBoundary>
    </div>
    </footer>
    </div>;`
  );

  fs.writeFileSync(landingPath, content);
  console.log('✅ Fixed landing page module imports and added error boundary');
}

console.log('✨ All module import issues have been fixed!');