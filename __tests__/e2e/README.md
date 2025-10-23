# E2E Test Suite for Leave Management System

This directory contains comprehensive end-to-end tests for the Leave Management application using Playwright with TypeScript.

## 📋 Test Coverage

### ✅ Completed Test Suites

1. **Landing Page Tests** (`landing-page.spec.ts`)
   - Sign-in button visibility and functionality
   - Hero section and CTA buttons
   - Feature cards and interactions
   - Trust badges and statistics
   - Responsive design (mobile, tablet, desktop)
   - Accessibility compliance (WCAG 2.1 AA)
   - Cross-browser compatibility
   - Performance testing

2. **Login Page Tests** (`login-page.spec.ts`)
   - Animated character interactions
   - Form validation and error handling
   - Password visibility toggle
   - Character mood changes based on input
   - Keyboard navigation
   - Accessibility testing
   - Mobile responsiveness
   - Edge cases and error scenarios

3. **Authentication Flow Tests** (`authentication-flow.spec.ts`)
   - Complete login/logout workflow
   - Multiple user roles (Employee, Manager, HR, Admin)
   - Session management and persistence
   - Security testing (XSS, SQL injection)
   - Redirect handling
   - Browser compatibility
   - Error handling and network issues

4. **Leave Request Lifecycle Tests** (`leave-request-lifecycle.spec.ts`)
   - Leave request creation and submission
   - Form validation and conflict detection
   - Status tracking and updates
   - Leave modification and cancellation
   - Filtering, searching, and sorting
   - Bulk operations
   - Real-time status updates
   - Mobile and accessibility testing

## 🏗️ Architecture

### Page Object Model (POM)

- `BasePage.ts` - Common functionality and utilities
- `LandingPage.ts` - Landing page interactions
- `LoginPage.ts` - Login page with character animations
- `DashboardPage.ts` - Main dashboard functionality
- `LeaveManagementPage.ts` - Leave request management

### Test Data Factory

- `TestDataFactory.ts` - Generates test data for different scenarios
- `TestFixtures.ts` - Playwright fixtures and test setup

### Test Configuration

- `test-runner.ts` - Main Playwright configuration
- `global-setup.ts` - Test environment setup
- `global-teardown.ts` - Test cleanup

## 🚀 Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Ensure Playwright browsers are installed
npx playwright install
```

### Development Testing

```bash
# Run all tests in development mode
npm run test:e2e

# Run specific test file
npx playwright test landing-page.spec.ts

# Run tests with UI mode
npx playwright test --ui

# Run tests with debugging
npx playwright test --debug

# Run tests in headed mode (show browser)
npx playwright test --headed
```

### Specific Test Categories

```bash
# Run smoke tests only
npx playwright test --grep "@smoke"

# Run accessibility tests
npx playwright test --grep "@a11y"

# Run mobile tests
npx playwright test --project="mobile-chrome"

# Run performance tests
npx playwright test --grep "@performance"
```

### Cross-browser Testing

```bash
# Run on all configured browsers
npm run test:e2e:all-browsers

# Run on specific browser
npx playwright test --project="chromium"
npx playwright test --project="firefox"
npx playwright test --project="webkit"
```

### Mobile Testing

```bash
# Run mobile-specific tests
npx playwright test --project="mobile-chrome"
npx playwright test --project="mobile-safari"
```

## 📊 Reports and Results

### Test Reports

- HTML Report: `playwright-report/html/index.html`
- JSON Report: `playwright-report/results.json`
- JUnit Report: `playwright-report/results.xml`

### Screenshots and Videos

- Screenshots: `test-results/screenshots/`
- Videos: `test-results/videos/`
- Traces: `test-results/traces/`

### View Reports

```bash
# Open HTML report
npx playwright show-report

# Open last test report
npm run test:e2e:report
```

## 🛠️ Configuration

### Environment Variables

```bash
# Base URL for testing
BASE_URL=http://localhost:3000

# Test environment
NODE_ENV=test

# CI/CD specific
CI=true
```

### Playwright Config

The main configuration is in `test-runner.ts` with support for:

- Multiple browsers and devices
- Parallel test execution
- Retry logic for CI
- Video and screenshot capture
- Trace recording for debugging
- Custom timeouts and thresholds

## 📱 Responsive Testing

### Viewports Tested

- **Desktop**: 1920x1080 (Chrome, Firefox, Safari)
- **Tablet**: 1024x1366 (iPad Pro)
- **Mobile**: 375x667 (iPhone), 393x851 (Pixel 5)

### Orientation Testing

- Portrait and landscape modes
- Touch interactions
- Mobile-specific UI elements

## ♿ Accessibility Testing

### WCAG 2.1 AA Compliance

- Keyboard navigation
- Screen reader support
- Color contrast validation
- ARIA labels and roles
- Focus management
- Semantic HTML structure

### Tools Used

- Playwright's built-in accessibility checks
- axe-core integration (if implemented)
- Manual keyboard navigation tests

## 🔒 Security Testing

### Authentication & Authorization

- Session management
- Role-based access control
- Login/logout flows
- Protected route handling

### Input Validation

- XSS prevention
- SQL injection protection
- Form validation
- Sanitization testing

## 📈 Performance Testing

### Metrics Tracked

- Page load times
- Time to interactive
- Animation performance
- Large dataset handling
- Memory usage

### Thresholds

- Page load: < 3 seconds
- Form submission: < 5 seconds
- Navigation: < 2 seconds

## 🐛 Debugging

### Debug Mode

```bash
# Run with debugging
npx playwright test --debug

# Run with headed mode
npx playwright test --headed

# Run with trace viewer
npx playwright test --trace on
```

### Trace Viewer

```bash
# View trace files
npx playwright show-trace test-results/traces/*.zip
```

### Screenshots

Screenshots are automatically captured:

- On test failure
- At key test steps
- For responsive testing

## 🔄 Continuous Integration

### GitHub Actions (if configured)

```yaml
# Example CI configuration
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Docker Support

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx playwright install
CMD ["npx", "playwright", "test"]
```

## 📝 Best Practices

### Test Organization

- Use Page Object Model pattern
- Group related tests in describe blocks
- Use descriptive test names
- Parameterize test data for reusability

### Test Data Management

- Use factory pattern for test data
- Clean up test data after each test
- Use realistic but safe test data

### Error Handling

- Handle network errors gracefully
- Test edge cases and invalid inputs
- Provide clear error messages

### Performance

- Use efficient selectors
- Avoid unnecessary waits
- Parallelize tests where possible

## 🚨 Troubleshooting

### Common Issues

1. **Tests failing due to timing**
   - Increase timeouts in test-runner.ts
   - Use proper wait methods

2. **Browser not installed**
   - Run `npx playwright install`
   - Update to latest Playwright version

3. **Tests failing on CI**
   - Check CI environment setup
   - Verify BASE_URL configuration
   - Review retry logic

4. **Flaky tests**
   - Increase retry count
   - Add proper waits
   - Review test isolation

### Getting Help

- Check Playwright documentation: https://playwright.dev/
- Review test logs and traces
- Use debugging tools
- Check GitHub Issues for known problems

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Accessibility Testing Guide](https://playwright.dev/docs/accessibility-testing)
- [Mobile Testing Guide](https://playwright.dev/docs/emulation)
- [Debugging Tests](https://playwright.dev/docs/debug)

## 🔄 Test Maintenance

### Regular Tasks

- Update test data factories
- Review and update selectors
- Check for deprecated APIs
- Update dependencies
- Review test coverage

### When to Update Tests

- Application UI changes
- New features added
- Bug fixes that affect test flow
- Performance improvements needed
- Browser updates causing issues
