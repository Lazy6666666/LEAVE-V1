# T-038: Accessibility & WCAG 2.1 AA Compliance - Implementation Guide

## Overview

**Task**: Accessibility & WCAG 2.1 AA Compliance
**Status**: 🔄 IN PROGRESS
**Priority**: MUST HAVE
**Effort**: Medium (M)
**Phase**: 6 - UX Enhancement & Polish

---

## Objectives

Achieve **WCAG 2.1 Level AA compliance** across all application features:
- ✅ Perceivable: Information presented in ways all users can perceive
- ✅ Operable: UI components navigable by all users
- ✅ Understandable: Content and operation understandable to all users
- ✅ Robust: Content interpretable by assistive technologies

---

## WCAG 2.1 AA Requirements

### Four Principles (POUR)

1. **Perceivable**
   - Text alternatives for non-text content
   - Captions and alternatives for multimedia
   - Content adaptable and distinguishable
   - Color contrast ratios met

2. **Operable**
   - Keyboard accessible
   - Enough time to read and use content
   - No seizure-inducing design
   - Navigable and findable content

3. **Understandable**
   - Readable and understandable text
   - Predictable page behavior
   - Input assistance and error prevention

4. **Robust**
   - Compatible with assistive technologies
   - Valid, semantic HTML
   - Proper ARIA usage

---

## Implementation Checklist

### 1. Color Contrast (WCAG 1.4.3 - Level AA)

**Requirement**:
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+ or 14pt+ bold): 3:1 contrast ratio
- UI components and graphics: 3:1 contrast ratio

#### Tools for Testing:
```bash
# Install axe DevTools Chrome Extension
# or use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
```

#### Current Issues to Check:

```tsx
// Check all color combinations in:
// 1. Text on backgrounds
// 2. Button text
// 3. Link colors
// 4. Form labels and inputs
// 5. Error messages
// 6. Notification badges
// 7. Status indicators
```

#### Implementation:

```tsx
// tailwind.config.ts - Ensure accessible color palette
export default {
  theme: {
    extend: {
      colors: {
        // Primary colors with AA-compliant contrast
        primary: {
          DEFAULT: '#0066CC', // 4.54:1 on white
          foreground: '#FFFFFF',
        },
        // Error states
        destructive: {
          DEFAULT: '#DC2626', // 4.51:1 on white
          foreground: '#FFFFFF',
        },
        // Background combinations
        background: '#FFFFFF',
        foreground: '#111827', // 16.28:1 on white
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#374151', // 10.36:1 on #F3F4F6
        },
      },
    },
  },
};
```

**Action Items**:
- [ ] Audit all color combinations with contrast checker
- [ ] Update colors that don't meet 4.5:1 ratio
- [ ] Test dark mode contrast ratios
- [ ] Document color palette with contrast ratios
- [ ] Ensure focus indicators have 3:1 contrast

---

### 2. Keyboard Navigation (WCAG 2.1.1, 2.1.2 - Level A)

**Requirement**: All functionality available via keyboard

#### Implementation:

```tsx
// Ensure proper tab order
<div>
  <button tabIndex={0}>First</button>
  <button tabIndex={0}>Second</button>
  <button tabIndex={0}>Third</button>
  {/* Don't use tabIndex > 0, it breaks natural tab order */}
</div>

// Add keyboard event handlers
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Custom Button
</div>

// Skip to main content link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

<main id="main-content">
  {/* Main content */}
</main>
```

#### Focus Management:

```tsx
'use client';

import { useEffect, useRef } from 'react';

export function Modal({ isOpen, onClose, children }) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the element that had focus before modal opened
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus first focusable element in modal
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }

    return () => {
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Trap focus within modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
```

**Action Items**:
- [ ] Test all pages with keyboard only (no mouse)
- [ ] Ensure logical tab order
- [ ] Add skip navigation links
- [ ] Implement focus trapping in modals/dialogs
- [ ] Add visible focus indicators
- [ ] Test keyboard shortcuts don't conflict
- [ ] Ensure dropdown menus keyboard accessible

---

### 3. ARIA Labels & Landmarks (WCAG 1.3.1, 4.1.2 - Level A)

**Requirement**: Proper semantic HTML and ARIA attributes

#### Semantic HTML Structure:

```tsx
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div>
      <header role="banner">
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/leaves">Leaves</a></li>
            <li><a href="/calendar">Calendar</a></li>
          </ul>
        </nav>
      </header>

      <main role="main" id="main-content">
        {children}
      </main>

      <aside role="complementary" aria-label="Notifications">
        <NotificationBell />
      </aside>

      <footer role="contentinfo">
        <p>&copy; 2025 Leave Management System</p>
      </footer>
    </div>
  );
}
```

#### ARIA Labels for Interactive Elements:

```tsx
// Button with icon only
<button
  aria-label="Close notification"
  onClick={handleClose}
>
  <X className="h-4 w-4" />
</button>

// Form inputs
<div>
  <label htmlFor="leave-type" className="sr-only">
    Leave Type
  </label>
  <select
    id="leave-type"
    aria-label="Select leave type"
    aria-required="true"
    aria-invalid={errors.type ? "true" : "false"}
    aria-describedby={errors.type ? "type-error" : undefined}
  >
    <option value="">Select type...</option>
    <option value="annual">Annual Leave</option>
  </select>
  {errors.type && (
    <span id="type-error" role="alert" className="text-red-600">
      {errors.type.message}
    </span>
  )}
</div>

// Loading states
<div role="status" aria-live="polite" aria-atomic="true">
  {isLoading ? 'Loading...' : `${items.length} items loaded`}
</div>

// Notification badge
<button aria-label={`${unreadCount} unread notifications`}>
  <Bell className="h-5 w-5" />
  {unreadCount > 0 && (
    <span aria-hidden="true" className="badge">
      {unreadCount}
    </span>
  )}
</button>
```

#### Screen Reader Only Text:

```css
/* globals.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

**Action Items**:
- [ ] Add semantic HTML5 landmarks (header, main, nav, aside, footer)
- [ ] Add `aria-label` to all icon-only buttons
- [ ] Add `aria-describedby` for form error messages
- [ ] Add `aria-live` regions for dynamic content
- [ ] Add `aria-expanded` for collapsible sections
- [ ] Add `aria-current` for active navigation items
- [ ] Ensure all form inputs have associated labels

---

### 4. Form Accessibility (WCAG 3.3.1, 3.3.2 - Level A)

**Requirement**: Clear labels, instructions, and error handling

#### Accessible Form Implementation:

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const leaveSchema = z.object({
  type: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export function LeaveRequestForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(leaveSchema),
  });

  const onSubmit = async (data) => {
    // Handle submission
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Leave request form"
      noValidate // Use custom validation
    >
      {/* Form-level error summary */}
      {Object.keys(errors).length > 0 && (
        <div role="alert" aria-live="assertive" className="error-summary">
          <h2>Please correct the following errors:</h2>
          <ul>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <a href={`#${field}`}>{error.message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Leave Type Field */}
      <div className="form-field">
        <label htmlFor="type" className="required">
          Leave Type
          <span aria-label="required">*</span>
        </label>
        <select
          id="type"
          {...register('type')}
          aria-required="true"
          aria-invalid={errors.type ? 'true' : 'false'}
          aria-describedby={errors.type ? 'type-error' : 'type-hint'}
        >
          <option value="">Select leave type</option>
          <option value="annual">Annual Leave</option>
          <option value="sick">Sick Leave</option>
        </select>
        <span id="type-hint" className="hint">
          Choose the type of leave you're requesting
        </span>
        {errors.type && (
          <span id="type-error" role="alert" className="error">
            {errors.type.message}
          </span>
        )}
      </div>

      {/* Date Fields */}
      <div className="form-field">
        <label htmlFor="startDate" className="required">
          Start Date
          <span aria-label="required">*</span>
        </label>
        <input
          type="date"
          id="startDate"
          {...register('startDate')}
          aria-required="true"
          aria-invalid={errors.startDate ? 'true' : 'false'}
          aria-describedby={errors.startDate ? 'start-error' : undefined}
        />
        {errors.startDate && (
          <span id="start-error" role="alert" className="error">
            {errors.startDate.message}
          </span>
        )}
      </div>

      {/* Reason Field */}
      <div className="form-field">
        <label htmlFor="reason" className="required">
          Reason
          <span aria-label="required">*</span>
        </label>
        <textarea
          id="reason"
          {...register('reason')}
          aria-required="true"
          aria-invalid={errors.reason ? 'true' : 'false'}
          aria-describedby="reason-hint reason-error"
          rows={4}
        />
        <span id="reason-hint" className="hint">
          Minimum 10 characters
        </span>
        {errors.reason && (
          <span id="reason-error" role="alert" className="error">
            {errors.reason.message}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        aria-label="Submit leave request"
      >
        Submit Request
      </button>
    </form>
  );
}
```

**Action Items**:
- [ ] Ensure all form inputs have associated labels
- [ ] Add `required` indicators (visual and ARIA)
- [ ] Implement inline validation with clear error messages
- [ ] Add form-level error summary
- [ ] Use `aria-describedby` for hints and errors
- [ ] Test form with screen reader
- [ ] Ensure error messages are announced

---

### 5. Screen Reader Support (WCAG 4.1.2 - Level A)

**Requirement**: Content interpretable by screen readers

#### Announce Dynamic Changes:

```tsx
// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// For urgent messages
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>

// For status updates
<div role="status" aria-live="polite">
  Saving... {saveProgress}%
</div>
```

#### Hide Decorative Elements:

```tsx
// Decorative images/icons
<svg aria-hidden="true" className="decorative-icon">
  <path d="..." />
</svg>

// Redundant text (already conveyed visually)
<button>
  Delete
  <span aria-hidden="true" className="icon">×</span>
</button>
```

#### Data Tables:

```tsx
<table>
  <caption>Leave Requests for October 2025</caption>
  <thead>
    <tr>
      <th scope="col">Employee</th>
      <th scope="col">Type</th>
      <th scope="col">Start Date</th>
      <th scope="col">End Date</th>
      <th scope="col">Status</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    {leaves.map((leave) => (
      <tr key={leave.id}>
        <th scope="row">{leave.user.full_name}</th>
        <td>{leave.type}</td>
        <td>{formatDate(leave.start_date)}</td>
        <td>{formatDate(leave.end_date)}</td>
        <td>
          <span className={`status-${leave.status}`}>
            {leave.status}
          </span>
        </td>
        <td>
          <button aria-label={`Approve leave for ${leave.user.full_name}`}>
            Approve
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**Action Items**:
- [ ] Add `aria-live` regions for notifications
- [ ] Add `aria-atomic` for content that should be read as whole
- [ ] Mark decorative images with `aria-hidden="true"`
- [ ] Test with NVDA (Windows) and VoiceOver (Mac)
- [ ] Ensure all interactive elements announced correctly
- [ ] Add table headers with `scope` attribute

---

### 6. Focus Indicators (WCAG 2.4.7 - Level AA)

**Requirement**: Visible focus indicator for keyboard users

#### CSS Implementation:

```css
/* globals.css */

/* Remove default outline */
*:focus {
  outline: none;
}

/* Custom focus styles */
*:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  border-radius: 4px;
}

/* For buttons */
button:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  box-shadow: 0 0 0 4px hsla(var(--primary), 0.2);
}

/* For links */
a:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  text-decoration: underline;
}

/* For inputs */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 0;
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 4px hsla(var(--primary), 0.1);
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: hsl(var(--primary));
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

**Action Items**:
- [ ] Add visible focus styles to all interactive elements
- [ ] Ensure focus indicators have 3:1 contrast ratio
- [ ] Test focus order is logical
- [ ] Add skip navigation links
- [ ] Test with keyboard only

---

### 7. Text Alternatives (WCAG 1.1.1 - Level A)

**Requirement**: All non-text content has text alternative

```tsx
// Images
<Image
  src="/chart.png"
  alt="Leave utilization chart showing 75% usage in Q4 2025"
  width={600}
  height={400}
/>

// Decorative images
<Image
  src="/pattern.svg"
  alt="" // Empty alt for decorative images
  aria-hidden="true"
  width={100}
  height={100}
/>

// Icons with meaning
<button>
  <Trash aria-hidden="true" />
  <span className="sr-only">Delete leave request</span>
</button>

// Complex graphics
<figure role="img" aria-labelledby="chart-title chart-desc">
  <figcaption>
    <h3 id="chart-title">Leave Trends 2025</h3>
    <p id="chart-desc">
      Bar chart showing leave usage increasing from 60% in Q1 to 85% in Q4.
      Annual leave is the most common type at 45%.
    </p>
  </figcaption>
  <canvas id="chart" />
</figure>
```

**Action Items**:
- [ ] Add descriptive alt text to all images
- [ ] Mark decorative images with empty alt
- [ ] Add text alternatives for charts/graphs
- [ ] Ensure icons have accessible labels
- [ ] Provide transcripts for audio/video (if any)

---

### 8. Page Titles & Headings (WCAG 2.4.2, 2.4.6 - Level A/AA)

**Requirement**: Descriptive page titles and logical heading structure

```tsx
// app/(dashboard)/leaves/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Leave Requests | Leave Management System',
  description: 'View and manage your leave requests',
};

export default function LeavesPage() {
  return (
    <div>
      <h1>My Leave Requests</h1>

      <section aria-labelledby="pending-heading">
        <h2 id="pending-heading">Pending Requests</h2>
        {/* Content */}
      </section>

      <section aria-labelledby="approved-heading">
        <h2 id="approved-heading">Approved Requests</h2>
        {/* Content */}
      </section>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading">Request History</h2>

        <h3>This Year</h3>
        {/* Content */}

        <h3>Last Year</h3>
        {/* Content */}
      </section>
    </div>
  );
}
```

**Action Items**:
- [ ] Ensure all pages have unique, descriptive titles
- [ ] Use proper heading hierarchy (h1 → h2 → h3)
- [ ] Don't skip heading levels
- [ ] Only one h1 per page
- [ ] Headings describe content that follows

---

### 9. Responsive Text & Zoom (WCAG 1.4.4, 1.4.10 - Level AA)

**Requirement**: Text can be resized up to 200% without loss of functionality

```tsx
// Use relative units (rem, em) not pixels
// tailwind.config.ts already uses rem by default

// Ensure text remains readable at 200% zoom
<div className="text-base md:text-lg"> {/* Use responsive text */}
  Content here
</div>

// Avoid fixed widths that break at zoom
<div className="max-w-7xl mx-auto px-4"> {/* Use max-width, not width */}
  Content here
</div>

// Test at different zoom levels
// 1. Browser zoom to 200%
// 2. Text-only zoom to 200%
// 3. Check mobile at different zoom levels
```

**Action Items**:
- [ ] Test all pages at 200% zoom
- [ ] Ensure no horizontal scrolling at zoom
- [ ] Use relative units (rem/em) instead of px
- [ ] Test text-only zoom
- [ ] Ensure content reflows properly

---

## Testing Tools & Process

### 1. Automated Testing

```bash
# Install axe-core for automated accessibility testing
npm install --save-dev @axe-core/react

# Add to app/layout.tsx (development only)
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### 2. Browser Extensions

- **axe DevTools**: https://www.deque.com/axe/devtools/
- **WAVE**: https://wave.webaim.org/extension/
- **Lighthouse**: Built into Chrome DevTools

### 3. Screen Readers

**Windows**:
- NVDA (free): https://www.nvaccess.org/
- JAWS (paid): https://www.freedomscientific.com/

**Mac**:
- VoiceOver (built-in): Cmd+F5

**Testing Checklist**:
- [ ] Navigate entire site with keyboard only
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Run axe DevTools on all pages
- [ ] Run Lighthouse accessibility audit
- [ ] Test at 200% zoom
- [ ] Test with Windows High Contrast mode
- [ ] Verify color contrast with checker tool

---

## WCAG 2.1 AA Compliance Checklist

### Perceivable

- [ ] 1.1.1 Non-text Content (A) - Alt text for images
- [ ] 1.3.1 Info and Relationships (A) - Semantic HTML/ARIA
- [ ] 1.3.2 Meaningful Sequence (A) - Logical reading order
- [ ] 1.3.4 Orientation (AA) - No orientation lock
- [ ] 1.3.5 Identify Input Purpose (AA) - Autocomplete attributes
- [ ] 1.4.3 Contrast (Minimum) (AA) - 4.5:1 text, 3:1 UI
- [ ] 1.4.4 Resize Text (AA) - Text resizable to 200%
- [ ] 1.4.5 Images of Text (AA) - Use real text, not images
- [ ] 1.4.10 Reflow (AA) - No 2D scrolling at 400% zoom
- [ ] 1.4.11 Non-text Contrast (AA) - 3:1 for UI components
- [ ] 1.4.12 Text Spacing (AA) - Content adjustable
- [ ] 1.4.13 Content on Hover/Focus (AA) - Dismissible/hoverable

### Operable

- [ ] 2.1.1 Keyboard (A) - All functionality via keyboard
- [ ] 2.1.2 No Keyboard Trap (A) - Can navigate away
- [ ] 2.1.4 Character Key Shortcuts (A) - Can be turned off/remapped
- [ ] 2.4.1 Bypass Blocks (A) - Skip navigation links
- [ ] 2.4.2 Page Titled (A) - Descriptive page titles
- [ ] 2.4.3 Focus Order (A) - Logical focus order
- [ ] 2.4.4 Link Purpose (A) - Clear link text
- [ ] 2.4.5 Multiple Ways (AA) - Multiple navigation methods
- [ ] 2.4.6 Headings and Labels (AA) - Descriptive headings
- [ ] 2.4.7 Focus Visible (AA) - Visible focus indicator
- [ ] 2.5.1 Pointer Gestures (A) - No complex gestures required
- [ ] 2.5.2 Pointer Cancellation (A) - Can cancel pointer actions
- [ ] 2.5.3 Label in Name (A) - Visual label matches accessible name
- [ ] 2.5.4 Motion Actuation (A) - Can disable motion

### Understandable

- [ ] 3.1.1 Language of Page (A) - Lang attribute set
- [ ] 3.1.2 Language of Parts (AA) - Lang for content changes
- [ ] 3.2.1 On Focus (A) - No context change on focus
- [ ] 3.2.2 On Input (A) - No unexpected context change
- [ ] 3.2.3 Consistent Navigation (AA) - Same nav on all pages
- [ ] 3.2.4 Consistent Identification (AA) - Same labels for same functions
- [ ] 3.3.1 Error Identification (A) - Errors identified in text
- [ ] 3.3.2 Labels or Instructions (A) - Clear form labels
- [ ] 3.3.3 Error Suggestion (AA) - Error correction suggestions
- [ ] 3.3.4 Error Prevention (AA) - Confirm before submission

### Robust

- [ ] 4.1.1 Parsing (A) - Valid HTML
- [ ] 4.1.2 Name, Role, Value (A) - Proper ARIA
- [ ] 4.1.3 Status Messages (AA) - Status updates announced

---

## Implementation Timeline

**Estimated Total Time**: 2-3 days

### Day 1: Semantic HTML & ARIA
- Add semantic landmarks (2 hours)
- Add ARIA labels to all interactive elements (3 hours)
- Fix heading hierarchy (1 hour)
- Test with screen reader (1 hour)

### Day 2: Keyboard & Focus
- Implement keyboard navigation (2 hours)
- Add focus indicators (1 hour)
- Add skip links (30 minutes)
- Test keyboard-only navigation (2 hours)

### Day 3: Forms & Color Contrast
- Fix color contrast issues (2 hours)
- Improve form accessibility (2 hours)
- Add error handling (1 hour)
- Final testing and fixes (2 hours)

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Deque University](https://dequeuniversity.com/)

---

**Status**: Ready for Implementation
**Next Steps**: Begin with automated audits, then manual testing
