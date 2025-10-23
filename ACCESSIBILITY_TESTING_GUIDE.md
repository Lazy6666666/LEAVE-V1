# Accessibility Testing Guide for Developers

## Quick Start

This guide provides step-by-step instructions for testing accessibility in the Leave Management System.

---

## 1. Automated Testing Setup

### Install Testing Dependencies

```bash
# Already installed
npm install --save-dev @axe-core/react

# Install browser extensions:
# 1. axe DevTools: https://www.deque.com/axe/devtools/
# 2. WAVE: https://wave.webaim.org/extension/
# 3. Lighthouse is built into Chrome DevTools
```

### Run Development Server

```bash
npm run dev
```

Then open: http://localhost:3000

---

## 2. Lighthouse Accessibility Audit

**Steps**:

1. Open Chrome DevTools (F12 or Right-click → Inspect)
2. Click the **"Lighthouse"** tab
3. Ensure **only "Accessibility"** is checked
4. Select **"Desktop"** or **"Mobile"**
5. Click **"Analyze page load"**
6. Wait for the report (30-60 seconds)

**What to Look For**:

- **Score**: Aim for 90+ (Target: 95-100)
- **Passed Audits**: Things working correctly
- **Opportunities**: Suggested improvements
- **Diagnostics**: Additional information

**Common Issues**:

| Issue                                                              | Fix                                       |
| ------------------------------------------------------------------ | ----------------------------------------- |
| "Image elements do not have [alt] attributes"                      | Add `alt="description"` to all images     |
| "Form elements do not have associated labels"                      | Add `<label htmlFor="id">` for each input |
| "Background and foreground colors do not have sufficient contrast" | Adjust colors to meet 4.5:1 ratio         |
| "Heading elements are not in a sequentially-descending order"      | Fix heading hierarchy (h1 → h2 → h3)      |

**Save the Report**:

- Click the download icon in top-right
- Save as JSON for comparison
- Compare scores over time

---

## 3. axe DevTools Testing

**Steps**:

1. Open Chrome DevTools (F12)
2. Click **"axe DevTools"** tab
3. Click **"Scan ALL of my page"** button
4. Review the results

**Understanding Results**:

- **Critical** (🔴): Must fix for compliance
- **Serious** (🟠): Should fix soon
- **Moderate** (🟡): Consider fixing
- **Minor** (🔵): Nice to fix

**For Each Violation**:

1. Click on the violation
2. Read the **"Issue Description"**
3. See **"To Solve This Violation"**
4. Check **"Highlight"** to see affected element
5. Copy the CSS selector or use **"Inspect Node"**
6. Fix the code
7. Re-scan to verify

**Example Fix**:

```tsx
// BEFORE (violation)
<button onClick={handleClose}>
  <X className="h-4 w-4" />
</button>

// AFTER (fixed)
<button onClick={handleClose} aria-label="Close notification">
  <X className="h-4 w-4" aria-hidden="true" />
</button>
```

---

## 4. WAVE Testing

**Steps**:

1. Click the **WAVE extension icon** in browser toolbar
2. Review the sidebar with:
   - **Errors** (red): Must fix
   - **Alerts** (yellow): Review carefully
   - **Features** (green): Good practices
   - **Structural Elements** (blue): Page structure
   - **Contrast Errors**: Click "Contrast" tab

**What to Check**:

| Icon      | Meaning   | Action                          |
| --------- | --------- | ------------------------------- |
| Red ❌    | Errors    | Fix immediately                 |
| Yellow ⚠️ | Alerts    | Review and fix if needed        |
| Green ✅  | Features  | Accessibility features detected |
| Blue ℹ️   | Structure | Verify correct usage            |

**Contrast Tab**:

- Shows all text with contrast ratios
- Red = Fails WCAG AA (must fix)
- Yellow = Fails WCAG AAA (optional)
- Green = Passes AA and AAA

---

## 5. Keyboard Navigation Testing

### Setup

1. **Hide your mouse** or unplug it
2. Use **only keyboard** for this test
3. Test every major page

### Keyboard Commands

| Key         | Action                             |
| ----------- | ---------------------------------- |
| Tab         | Move to next interactive element   |
| Shift + Tab | Move to previous element           |
| Enter       | Activate button/link, submit form  |
| Space       | Activate button, toggle checkbox   |
| Escape      | Close modal/dialog/tooltip         |
| Arrow Keys  | Navigate within select/radio group |

### Test Checklist

**Every Page**:

- [ ] Press Tab - skip link appears and works
- [ ] Tab through all interactive elements
- [ ] Focus indicator visible on each element
- [ ] Tab order matches visual order
- [ ] All buttons/links reachable
- [ ] No keyboard traps (can Tab away from everything)

**Forms**:

- [ ] Tab to first input
- [ ] Label announced by screen reader
- [ ] Fill out form with keyboard only
- [ ] Tab to submit button
- [ ] Enter submits the form
- [ ] Errors appear and focus moves to first error

**Modals/Dialogs**:

- [ ] Tab opens the modal trigger
- [ ] Enter opens the modal
- [ ] Focus moves into modal
- [ ] Tab cycles through modal elements only
- [ ] Escape closes the modal
- [ ] Focus returns to trigger element

**Dropdowns/Selects**:

- [ ] Tab to select
- [ ] Enter or Space opens dropdown
- [ ] Arrow keys navigate options
- [ ] Enter selects option
- [ ] Escape closes dropdown

**Calendar**:

- [ ] Tab to calendar
- [ ] Arrow keys navigate dates
- [ ] Enter selects date
- [ ] Tab moves to next/previous month buttons

### Common Issues

| Issue                  | Fix                                |
| ---------------------- | ---------------------------------- |
| Focus not visible      | Check focus-visible styles in CSS  |
| Wrong tab order        | Ensure no positive tabindex values |
| Can't Tab to element   | Add tabindex="0" or use <button>   |
| Keyboard trap in modal | Implement focus trap correctly     |
| Skip link doesn't work | Ensure id="main-content" exists    |

---

## 6. Screen Reader Testing

### Windows (NVDA)

**Install**:

1. Download: https://www.nvaccess.org/
2. Install and run
3. Press **Ctrl+Alt+N** to start

**Basic Commands**:

| Key        | Action                   |
| ---------- | ------------------------ |
| ↓ Arrow    | Next item                |
| ↑ Arrow    | Previous item            |
| Tab        | Next interactive element |
| H          | Next heading             |
| Shift+H    | Previous heading         |
| F          | Next form field          |
| B          | Next button              |
| L          | Next list                |
| K          | Next link                |
| R          | Next region (landmark)   |
| NVDA+Space | Toggle focus/browse mode |
| Insert+↓   | Read all                 |

**Test Checklist**:

- [ ] Press H repeatedly - heading hierarchy makes sense
- [ ] Press F - all form fields have labels
- [ ] Press B - all buttons describe their action
- [ ] Press K - all links describe destination
- [ ] Press R - landmarks are logical
- [ ] Tab through form - labels announced with inputs
- [ ] Submit form with error - error message announced
- [ ] Navigate notifications - count updates announced

### Mac (VoiceOver)

**Enable**:

- Press **Cmd+F5**

**Basic Commands**:

| Key      | Action                          |
| -------- | ------------------------------- |
| VO+→     | Next item (VO = Control+Option) |
| VO+←     | Previous item                   |
| VO+U     | Open rotor (quick navigation)   |
| VO+A     | Read all                        |
| VO+Space | Activate item                   |
| Tab      | Next interactive element        |
| VO+Cmd+H | Next heading                    |
| VO+Cmd+J | Next form control               |
| VO+Cmd+L | Next link                       |

**Test Checklist**:

- [ ] VO+A reads entire page correctly
- [ ] VO+U shows rotor with headings, links, forms
- [ ] All headings in logical order
- [ ] All form fields have labels
- [ ] All buttons describe their action
- [ ] Error messages announced
- [ ] Loading states announced

### What to Listen For

**Good Announcements**:

- "Link, Dashboard" (not just "Dashboard")
- "Edit, button, Opens leave request edit form"
- "Email, text field, required"
- "Submit Request, button"
- "Heading level 1, Notifications"
- "5 unread notifications"
- "Loading notifications, status"

**Bad Announcements**:

- "Clickable, clickable, clickable" (divs with onClick)
- "Button" (no description)
- "Image" (no alt text)
- Just reading HTML/CSS (spans, divs)
- Silent when important content updates

---

## 7. Color Contrast Testing

### WebAIM Contrast Checker

**URL**: https://webaim.org/resources/contrastchecker/

**Steps**:

1. Inspect element to find colors
2. Enter foreground color (text color)
3. Enter background color
4. Check the ratio

**Requirements**:

| Element Type                       | Minimum Ratio |
| ---------------------------------- | ------------- |
| Normal text (< 18pt)               | 4.5:1         |
| Large text (≥ 18pt or ≥ 14pt bold) | 3:1           |
| UI components (buttons, borders)   | 3:1           |
| Focus indicators                   | 3:1           |

**Test All Combinations**:

```markdown
# Text on Backgrounds

- Normal text on white background
- Normal text on light gray background
- Normal text on colored background
- Link text on white background
- Button text on button background
- Error text on white background
- Error text on error background
- Muted text on muted background

# UI Components

- Button borders
- Input borders
- Focus indicators
- Status badges
- Notification badges
- Icons with meaning

# States

- Default state
- Hover state
- Focus state
- Active state
- Disabled state (no requirement but should be visible)
```

### Browser DevTools Contrast Checker

**Chrome/Edge**:

1. Inspect element
2. Look at Styles panel
3. Click the color square next to color value
4. See contrast ratio in color picker
5. Red = Fail, Green = Pass

---

## 8. Zoom and Reflow Testing

### 200% Zoom Test

**Steps**:

1. Press **Ctrl/Cmd + 0** to reset zoom
2. Press **Ctrl/Cmd + +** (plus) five times (200%)
3. Test the page

**Checklist**:

- [ ] All text readable
- [ ] No horizontal scrolling (except data tables)
- [ ] All buttons clickable
- [ ] All links clickable
- [ ] Form inputs usable
- [ ] Navigation still works
- [ ] Content doesn't overlap

### 400% Zoom Test (Reflow)

**Steps**:

1. Set viewport to 1280px width
2. Zoom to 400%
3. Effective width = 320px

**Checklist**:

- [ ] Content reflows (stacks vertically)
- [ ] No 2D scrolling required
- [ ] All content accessible
- [ ] No content cut off

### Mobile Responsive Test

**Devices to Test**:

- Mobile: 320px, 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1366px, 1920px

**Checklist**:

- [ ] Touch targets ≥ 44×44px
- [ ] Sufficient spacing between elements
- [ ] No pinch zoom required
- [ ] All functionality accessible
- [ ] Text readable without zoom

---

## 9. Form Accessibility Testing

### Form Checklist

**Labels**:

- [ ] Every input has a label
- [ ] Label is associated (htmlFor matches id)
- [ ] Label is visible (not just placeholder)
- [ ] Required fields marked with \* and aria-required
- [ ] Optional fields clearly indicated

**Error Handling**:

- [ ] Errors identified in text (not just color)
- [ ] Error summary at top of form
- [ ] aria-invalid on error fields
- [ ] aria-describedby links to error message
- [ ] Focus moves to error summary on submit
- [ ] Error messages provide helpful suggestions

**Helpful Text**:

- [ ] Hints provided for complex inputs
- [ ] Format requirements explained
- [ ] Character limits shown
- [ ] Validation rules clear
- [ ] Examples provided where helpful

**Keyboard**:

- [ ] Can fill entire form with keyboard
- [ ] Tab order is logical
- [ ] Can submit with Enter key
- [ ] Can reset/cancel with keyboard
- [ ] Date pickers keyboard accessible

**Screen Reader**:

- [ ] Labels announced with inputs
- [ ] Required status announced
- [ ] Error messages announced
- [ ] Hints announced
- [ ] Field type announced (email, phone, etc.)

---

## 10. Testing Workflow

### Daily Development

1. **Before Committing**:

   ```bash
   # Quick check
   - Run Lighthouse (1 min)
   - Tab through your changes (2 min)
   - Check focus indicators (1 min)
   ```

2. **For New Components**:

   ```bash
   - Run axe DevTools scan (2 min)
   - Test keyboard navigation (5 min)
   - Check ARIA labels (3 min)
   - Test with screen reader (5 min)
   ```

3. **For Forms**:
   ```bash
   - Test all error states (5 min)
   - Test keyboard navigation (5 min)
   - Test screen reader (10 min)
   - Check label associations (2 min)
   ```

### Before Pull Request

```markdown
- [ ] Lighthouse score ≥ 90
- [ ] axe DevTools: 0 critical violations
- [ ] Keyboard navigation works on all pages
- [ ] Focus indicators visible everywhere
- [ ] Screen reader test passed
- [ ] Color contrast checked (4.5:1)
- [ ] Zoom to 200% test passed
```

### Before Release

```markdown
- [ ] Full accessibility audit completed
- [ ] All WCAG 2.1 AA criteria met
- [ ] User acceptance testing with disabled users
- [ ] Accessibility documentation updated
- [ ] Team trained on accessibility standards
```

---

## Common Fixes Cheat Sheet

### Missing Alt Text

```tsx
// Before
<img src="/chart.png" />

// After
<img src="/chart.png" alt="Leave utilization chart showing 75% usage in Q4" />
```

### Icon-Only Button

```tsx
// Before
<button onClick={handleClose}>
  <X className="h-4 w-4" />
</button>

// After
<button onClick={handleClose} aria-label="Close notification">
  <X className="h-4 w-4" aria-hidden="true" />
</button>
```

### Form Input Without Label

```tsx
// Before
<input type="email" placeholder="Email" />

// After
<label htmlFor="email">Email Address</label>
<input id="email" type="email" placeholder="you@example.com" />
```

### Form Error

```tsx
// Before
<input type="text" className="error" />
<span className="error-message">This field is required</span>

// After
<input
  type="text"
  id="name"
  aria-invalid="true"
  aria-describedby="name-error"
/>
<span id="name-error" role="alert" className="error-message">
  This field is required. Please enter your full name.
</span>
```

### Clickable Div

```tsx
// Before
<div onClick={handleClick} className="cursor-pointer">
  Click me
</div>

// After
<button onClick={handleClick} className="cursor-pointer">
  Click me
</button>
```

### Skip Link

```tsx
// Add to layout
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// Add to page
<main id="main-content">
  {/* page content */}
</main>
```

### Live Region Update

```tsx
// Before
<p>{notificationCount} notifications</p>

// After
<p role="status" aria-live="polite">
  {notificationCount} notification{notificationCount !== 1 ? 's' : ''}
</p>
```

### Decorative Image

```tsx
// Before
<img src="/decoration.svg" alt="decoration" />

// After
<img src="/decoration.svg" alt="" aria-hidden="true" />
```

---

## Resources

### Browser Extensions

- **axe DevTools**: https://www.deque.com/axe/devtools/
- **WAVE**: https://wave.webaim.org/extension/
- **ANDI**: https://www.ssa.gov/accessibility/andi/help/install.html

### Screen Readers

- **NVDA (Windows)**: https://www.nvaccess.org/
- **JAWS (Windows)**: https://www.freedomscientific.com/products/software/jaws/
- **VoiceOver (Mac)**: Built-in (Cmd+F5)
- **TalkBack (Android)**: Built-in

### Online Tools

- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Color Contrast Analyzer**: https://www.tpgi.com/color-contrast-checker/
- **Accessible Colors**: https://accessible-colors.com/

### Documentation

- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM**: https://webaim.org/
- **A11Y Project**: https://www.a11yproject.com/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility

---

## Quick Reference Card

**Print this and keep it nearby!**

```
KEYBOARD TESTING
- Tab = next element
- Shift+Tab = previous element
- Enter = activate link/button
- Space = activate button/checkbox
- Escape = close modal/tooltip
- Arrows = navigate within component

SCREEN READER (NVDA)
- H = next heading
- F = next form field
- B = next button
- L = next list
- K = next link
- R = next landmark

COLOR CONTRAST
- Normal text: 4.5:1
- Large text: 3:1
- UI components: 3:1

FOCUS INDICATORS
- Must be visible
- 2px minimum
- 3:1 contrast ratio

FORMS
- Every input needs label
- Required fields: aria-required
- Errors: aria-invalid + aria-describedby
- Error summary at top

COMMON FIXES
- Icon buttons need aria-label
- Decorative images: aria-hidden
- Live updates: aria-live
- Skip link on every page
- id="main-content" on main
```

---

**Happy Testing!**

Remember: Accessibility isn't a feature, it's a fundamental requirement. Test early, test often, and make it part of your daily workflow.
