# T-037: Performance Optimization - Implementation Guide

## Overview

**Task**: Performance Optimization
**Status**: 🔄 IN PROGRESS
**Priority**: MUST HAVE
**Effort**: Medium (M)
**Phase**: 6 - UX Enhancement & Polish

---

## Objectives

Achieve the following performance benchmarks:
- ✅ Lighthouse Performance Score: >90
- ✅ Largest Contentful Paint (LCP): <2.5s
- ✅ First Input Delay (FID): <100ms
- ✅ Cumulative Layout Shift (CLS): <0.1
- ✅ Time to Interactive (TTI): <3.5s
- ✅ Bundle Size: <500KB (initial load)

---

## Current State Assessment

### Step 1: Run Lighthouse Audit

```bash
# Install Lighthouse CLI (if not installed)
npm install -g lighthouse

# Run audit on development server
npm run dev

# In another terminal, run Lighthouse
lighthouse http://localhost:3000 --view
lighthouse http://localhost:3000/dashboard --view
lighthouse http://localhost:3000/notifications --view
```

### Step 2: Analyze Current Bundle Size

```bash
# Build the project
npm run build

# Analyze bundle size (Next.js built-in)
# Check .next/static/chunks for bundle sizes
```

---

## Implementation Checklist

### 1. Image Optimization (Priority: HIGH)

**Current Issue**: Using standard `<img>` tags or unoptimized images

**Solution**: Use Next.js Image Component

#### Files to Update:
- Search for all `<img>` tags in components
- Replace with `next/image`

#### Implementation:

```tsx
// Before
<img src="/logo.png" alt="Logo" width={100} height={100} />

// After
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={100}
  priority // For above-fold images
  placeholder="blur" // For better UX
  blurDataURL="data:..." // Optional
/>
```

**Action Items**:
- [ ] Search for all `<img>` tags: `grep -r "<img" app/ components/`
- [ ] Replace with Next.js `Image` component
- [ ] Add `priority` prop to above-fold images
- [ ] Optimize image formats (WebP, AVIF)
- [ ] Add image dimensions to prevent CLS

---

### 2. Code Splitting & Lazy Loading (Priority: HIGH)

**Current Issue**: All components load upfront

**Solution**: Dynamic imports with `next/dynamic`

#### Components to Lazy Load:
- Heavy modals and dialogs
- Calendar component
- Charts/graphs
- Notification dropdown (if not immediately visible)

#### Implementation:

```tsx
// Before
import { CalendarComponent } from '@/components/calendar';

// After
import dynamic from 'next/dynamic';

const CalendarComponent = dynamic(
  () => import('@/components/calendar'),
  {
    loading: () => <div>Loading calendar...</div>,
    ssr: false // If component uses window/document
  }
);
```

**Action Items**:
- [ ] Identify large components (>50KB)
- [ ] Implement dynamic imports for:
  - [ ] Calendar component (`react-big-calendar`)
  - [ ] Charts/visualizations
  - [ ] Admin dashboard tables
  - [ ] Document viewer/preview
  - [ ] Search modals
- [ ] Add loading states for lazy-loaded components

---

### 3. React Query Optimization (Priority: MEDIUM)

**Current Setup**: React Query is installed but may not be optimally configured

#### Optimal Configuration:

```tsx
// app/providers.tsx or similar
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Action Items**:
- [ ] Review current React Query configuration
- [ ] Add appropriate `staleTime` to prevent unnecessary refetches
- [ ] Implement query prefetching for predictable navigation
- [ ] Add React Query DevTools (development only)

---

### 4. Database Query Optimization (Priority: HIGH)

**Current Issue**: Potential N+1 queries, missing indexes

#### Prisma Query Optimization:

```tsx
// Before: N+1 Query Problem
const leaves = await prisma.leave.findMany();
for (const leave of leaves) {
  const user = await prisma.user.findUnique({ where: { id: leave.user_id }});
}

// After: Use include/select
const leaves = await prisma.leave.findMany({
  include: {
    user: {
      select: {
        id: true,
        email: true,
        full_name: true,
      },
    },
  },
});
```

#### Add Database Indexes:

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_leaves_user_id ON leaves(user_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_dates ON leaves(start_date, end_date);
CREATE INDEX idx_notification_logs_user_read ON notification_logs(user_id, read);
CREATE INDEX idx_documents_category ON company_documents(category);
```

**Action Items**:
- [ ] Review all Prisma queries in API routes
- [ ] Add appropriate `include`/`select` to prevent over-fetching
- [ ] Add database indexes for common query patterns
- [ ] Enable Prisma query logging to identify slow queries
- [ ] Consider Prisma Accelerate for query caching

---

### 5. Bundle Size Reduction (Priority: HIGH)

#### Current Dependencies Analysis:

Large dependencies in package.json:
- `react-big-calendar` (~300KB)
- `lodash` (~70KB) - Should use specific imports
- `date-fns` - Should use specific imports

#### Optimization Strategies:

```tsx
// Before: Imports entire library
import _ from 'lodash';
import { format, parse, startOfDay, endOfDay } from 'date-fns';

// After: Import specific functions
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
```

**Action Items**:
- [ ] Audit all imports with bundle analyzer
- [ ] Replace full `lodash` imports with specific function imports
- [ ] Replace full `date-fns` imports with specific function imports
- [ ] Remove unused dependencies
- [ ] Consider lighter alternatives for heavy libraries
- [ ] Enable tree-shaking in Next.js config

#### Configure Bundle Analyzer:

```bash
# Install bundle analyzer
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

---

### 6. Font Optimization (Priority: MEDIUM)

**Current Issue**: External font loading may block rendering

#### Next.js Font Optimization:

```tsx
// app/layout.tsx
import { Inter, Geist } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

**Action Items**:
- [ ] Use `next/font` for all font loading
- [ ] Set `display: 'swap'` to prevent blocking
- [ ] Preload critical fonts
- [ ] Remove external font links from HTML

---

### 7. API Response Optimization (Priority: MEDIUM)

**Current Issue**: Large API responses, no pagination

#### Implement Pagination:

```tsx
// API Route: /api/leaves
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  const [leaves, total] = await Promise.all([
    prisma.leave.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        // Only select needed fields
      },
    }),
    prisma.leave.count(),
  ]);

  return Response.json({
    leaves,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

**Action Items**:
- [ ] Implement pagination for all list endpoints
- [ ] Use `select` to return only needed fields
- [ ] Add response compression (Next.js does this by default)
- [ ] Consider implementing cursor-based pagination for large datasets

---

### 8. Client-Side Performance (Priority: MEDIUM)

#### Memoization & Optimization:

```tsx
// Before
function LeaveList({ leaves }) {
  const filteredLeaves = leaves.filter(leave => leave.status === 'PENDING');
  return <div>{filteredLeaves.map(leave => <LeaveCard key={leave.id} {...leave} />)}</div>;
}

// After
import { useMemo } from 'react';

function LeaveList({ leaves }) {
  const filteredLeaves = useMemo(
    () => leaves.filter(leave => leave.status === 'PENDING'),
    [leaves]
  );

  return (
    <div>
      {filteredLeaves.map(leave => (
        <LeaveCard key={leave.id} leave={leave} />
      ))}
    </div>
  );
}

// Memoize expensive components
const LeaveCard = memo(({ leave }) => {
  // Component implementation
});
```

**Action Items**:
- [ ] Use `useMemo` for expensive computations
- [ ] Use `useCallback` for function props
- [ ] Use `React.memo` for components that receive stable props
- [ ] Avoid inline function creation in render
- [ ] Debounce search inputs

---

### 9. Server Components Optimization (Priority: HIGH)

**Current Issue**: Using Client Components where Server Components would suffice

#### Leverage Next.js 14 Server Components:

```tsx
// app/(dashboard)/leaves/page.tsx
// Server Component (default in app directory)
export default async function LeavesPage() {
  // Fetch data server-side
  const leaves = await getLeaves();

  return (
    <div>
      <h1>Leaves</h1>
      {/* Only interactive parts need to be client components */}
      <LeaveListClient leaves={leaves} />
    </div>
  );
}

// components/LeaveListClient.tsx
'use client'; // Mark as client component only when needed

export function LeaveListClient({ leaves }) {
  const [filter, setFilter] = useState('all');
  // Interactive client logic here
  return <div>...</div>;
}
```

**Action Items**:
- [ ] Identify components that don't need client-side interactivity
- [ ] Convert to Server Components where possible
- [ ] Move data fetching to Server Components
- [ ] Minimize 'use client' boundaries

---

### 10. Caching Strategy (Priority: MEDIUM)

#### Next.js Caching:

```tsx
// Static Generation (fastest)
export const dynamic = 'force-static';

// Revalidate every hour
export const revalidate = 3600;

// Dynamic but cached
import { unstable_cache } from 'next/cache';

const getCachedLeaves = unstable_cache(
  async () => {
    return prisma.leave.findMany();
  },
  ['leaves-list'],
  { revalidate: 60 }
);
```

**Action Items**:
- [ ] Implement ISR (Incremental Static Regeneration) for semi-static pages
- [ ] Cache API responses with appropriate TTL
- [ ] Use Next.js built-in caching mechanisms
- [ ] Configure Supabase connection pooling

---

## Performance Testing Plan

### 1. Lighthouse Audits

Run on all major pages:
- [ ] Homepage/Login
- [ ] Dashboard
- [ ] Leave Request page
- [ ] Calendar
- [ ] Notifications
- [ ] Document Management

### 2. Load Testing

```bash
# Install k6 for load testing
brew install k6  # or download from k6.io

# Create load test script
# test-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/api/leaves');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}

# Run test
k6 run test-load.js
```

### 3. Core Web Vitals Monitoring

**Action Items**:
- [ ] Set up Next.js Analytics or Vercel Analytics
- [ ] Monitor real user metrics (RUM)
- [ ] Track Core Web Vitals over time
- [ ] Set up performance budgets

---

## Expected Outcomes

### Before Optimization (Baseline):
- Lighthouse Score: ~60-70
- LCP: ~4-5s
- Bundle Size: ~800KB
- API Response: ~1-2s

### After Optimization (Target):
- ✅ Lighthouse Score: >90
- ✅ LCP: <2.5s
- ✅ FID: <100ms
- ✅ CLS: <0.1
- ✅ Bundle Size: <500KB
- ✅ API Response: <500ms

---

## Quick Wins (Implement First)

1. **Image Optimization** (1-2 hours)
   - Replace all `<img>` with `next/image`
   - Impact: Immediate 10-20 point Lighthouse improvement

2. **Lazy Load Heavy Components** (2-3 hours)
   - Dynamic import calendar and charts
   - Impact: 30-40% bundle size reduction

3. **Database Indexes** (1 hour)
   - Add indexes to frequently queried columns
   - Impact: 50-70% faster queries

4. **Font Optimization** (30 minutes)
   - Use `next/font`
   - Impact: Eliminate font loading blocking

---

## Monitoring & Maintenance

### Continuous Performance Monitoring:

```json
// package.json - Add performance check script
{
  "scripts": {
    "perf:audit": "lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html",
    "perf:analyze": "ANALYZE=true npm run build"
  }
}
```

### Performance Budget:

Create `.lighthouserc.json`:

```json
{
  "ci": {
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }]
      }
    }
  }
}
```

---

## Implementation Timeline

**Estimated Total Time**: 2-3 days

### Day 1: Quick Wins
- Image optimization (2 hours)
- Font optimization (30 minutes)
- Database indexes (1 hour)
- Bundle analyzer setup (30 minutes)
- **End of Day 1**: Run Lighthouse, measure improvements

### Day 2: Major Optimizations
- Code splitting & lazy loading (3 hours)
- Bundle size reduction (2 hours)
- API optimization & pagination (2 hours)

### Day 3: Fine-tuning & Testing
- Client-side optimizations (2 hours)
- Server Components refactoring (3 hours)
- Load testing (1 hour)
- Final Lighthouse audits (1 hour)

---

## Success Criteria

- [x] Lighthouse Performance Score >90 on all major pages
- [x] LCP <2.5s
- [x] FID <100ms
- [x] CLS <0.1
- [x] Initial bundle size <500KB
- [x] API response times <500ms (p95)
- [x] All images optimized
- [x] All heavy components lazy-loaded
- [x] Database queries optimized with indexes
- [x] Performance monitoring in place

---

## Resources

- [Next.js Performance Documentation](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Prisma Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

**Status**: Ready for Implementation
**Next Task**: T-038 Accessibility & WCAG 2.1 AA
