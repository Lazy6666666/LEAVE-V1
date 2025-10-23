---
description: "Task list for Leave Management System implementation"
---

# Tasks: Leave Management System

**Input**: Design documents from `/specs/001-leave-management-system/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅)

**Tests**: Tests are MANDATORY - comprehensive testing required as per spec.md Section: Quality Assurance & Testing

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `app/`, `components/`, `lib/`, `prisma/` at repository root

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Project initialization and basic structure

- [x] T001 Verify existing Next.js project structure has required directories
- [x] T002 [P] Update package.json with required dependencies if missing
- [x] T003 [P] Configure ESLint and Prettier rules for TypeScript strict mode
- [x] T004 [P] Verify Supabase configuration in .env.local
- [x] T005 [P] Initialize Prisma schema validation
- [x] T006 Setup performance monitoring with bundle analyzer
- [x] T007 [P] Configure global CSS with accessibility styles

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Update Prisma schema with leave management tables
- [x] T009 [P] Create Prisma migrations for database schema
- [x] T010 [P] Implement Supabase RLS policies for all tables
- [x] T011 [P] Setup middleware for route protection in app/middleware.ts
- [x] T012 Create authentication helpers in lib/supabase/auth-helpers.ts
- [x] T013 [P] Setup API route structure with error handling
- [x] T014 Create base UI components layout in components/layout/
- [x] T015 Setup React Query provider with optimized configuration
- [x] T016 Create notification service base in lib/services/notification.ts
- [x] T017 Setup audit logging infrastructure in lib/services/audit.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Employee Leave Request (Priority: P1) 🎯 MVP ✅ COMPLETE

**Goal**: Enable employees to submit leave requests, view balance, and track status

**Independent Test**: Employee can submit a leave request and see it in their dashboard with correct status updates

### Implementation for User Story 1

- [x] T018 [P] [US1] Create LeaveRequestForm component in components/forms/LeaveRequestForm.tsx
- [x] T019 [P] [US1] Create LeaveStatusBadge component in components/employee/LeaveStatusBadge.tsx
- [x] T020 [P] [US1] Create leave validation schema in lib/validations/leave.ts
- [x] T021 [US1] Implement leave balance calculation service in lib/services/leave-balance.ts
- [x] T022 [P] [US1] Create API route for leave submissions in app/api/leaves/route.ts
- [x] T023 [P] [US1] Create API route for leave listing in app/api/leaves/route.ts
- [x] T024 [US1] Create employee leave page in app/(dashboard)/employee/leaves/page.tsx
- [x] T025 [US1] Create new leave request page in app/(dashboard)/employee/leaves/new/page.tsx
- [x] T026 [US1] Implement leave conflict detection in lib/services/conflict-detection.ts
- [x] T027 [US1] Add leave request submission to notification service
- [x] T028 [US1] Add audit logging for leave operations

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Manager Approval Workflow (Priority: P1) 🎯 MVP ✅ COMPLETE

**Goal**: Enable managers to review, approve, and reject team leave requests

**Independent Test**: Manager can receive a notification, review a request, and make an approval decision that updates the employee's balance

### Implementation for User Story 2

- [x] T029 [P] [US2] Create LeaveRequestCard component in components/manager/LeaveRequestCard.tsx
- [x] T030 [P] [US2] Create RejectModal component in components/manager/RejectModal.tsx
- [x] T031 [P] [US2] Create ConflictWarning component in components/manager/ConflictWarning.tsx
- [x] T032 [P] [US2] Create API route for approvals in app/api/leaves/[id]/approve/route.ts
- [x] T033 [P] [US2] Create API route for rejections in app/api/leaves/[id]/reject/route.ts
- [x] T034 [P] [US2] Create API route for leave cancellations in app/api/leaves/[id]/cancel/route.ts
- [x] T035 [US2] Create manager approvals page in app/(dashboard)/manager/approvals/page.tsx
- [x] T036 [US2] Implement team leave overlap detection service
- [x] T037 [US2] Add approval/rejection notifications to notification service
- [x] T038 [US2] Add audit logging for manager decisions
- [x] T039 [US2] Create ConflictWarning component for calendar view in components/calendar/ConflictWarning.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Team Calendar Visibility (Priority: P2) ✅ COMPLETE

**Goal**: Provide visual team calendar with approved leave and filtering

**Independent Test**: Calendar displays approved leave with proper filtering capabilities

### Implementation for User Story 3

- [x] T040 [P] [US3] Create TeamCalendar component in components/calendar/TeamCalendar.tsx
- [x] T041 [P] [US3] Create CalendarEvent component in components/calendar/CalendarEvent.tsx
- [x] T042 [P] [US3] Create CalendarFilters component in components/calendar/CalendarFilters.tsx
- [x] T043 [P] [US3] Create API route for calendar data in app/api/calendar/route.ts
- [x] T044 [US3] Create calendar page in app/(dashboard)/calendar/page.tsx
- [x] T045 [US3] Implement calendar service in lib/services/calendar.ts
- [x] T046 [US3] Add real-time calendar updates via Supabase Realtime
- [x] T047 [P] [US3] Add calendar-specific CSS styles in components/calendar/calendar.css
- [x] T048 [US3] Create TeamAvailability component in components/calendar/TeamAvailability.tsx
- [x] T049 [US3] Add calendar conflict checking API endpoint in app/api/calendar/conflicts/route.ts

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Document Management (Priority: P2) ✅ COMPLETE

**Goal**: Enable HR to upload, manage, and control access to company documents

**Independent Test**: HR can upload a document, set permissions, and verify authorized users can access it

### Implementation for User Story 4

- [x] T050 [P] [US4] Create DocumentUploadForm component in components/documents/DocumentUploadForm.tsx
- [x] T051 [P] [US4] Create DocumentCard component in components/documents/DocumentCard.tsx
- [x] T052 [P] [US4] Create DocumentFilters component in components/documents/DocumentFilters.tsx
- [x] T053 [P] [US4] Create DocumentList component in components/documents/DocumentList.tsx
- [x] T054 [P] [US4] Create document validation schema in lib/validations/document.ts
- [x] T055 [P] [US4] Implement document storage service in lib/services/document-storage.ts
- [x] T056 [P] [US4] Implement document access control in lib/services/document-access.ts
- [x] T057 [P] [US4] Implement document expiry tracking in lib/services/document-expiry.ts
- [x] T058 [P] [US4] Create API route for documents in app/api/documents/route.ts
- [x] T059 [P] [US4] Create API route for document operations in app/api/documents/[id]/route.ts
- [x] T060 [P] [US4] Create API route for document downloads in app/api/documents/[id]/download/route.ts
- [x] T061 [P] [US4] Create API route for expiry checks in app/api/documents/expiry/route.ts
- [x] T062 [US4] Create documents page in app/(dashboard)/documents/page.tsx
- [x] T063 [US4] Create document upload page in app/(dashboard)/documents/upload/page.tsx
- [x] T064 [US4] Implement document audit logging in lib/services/document-audit.ts
- [x] T065 [US4] Add document expiry notifications to notification service

**Checkpoint**: Document management should be fully functional with proper access controls

---

## Phase 7: User Story 5 - Administrative Configuration (Priority: P3) ✅ COMPLETE

**Goal**: Enable admins to configure leave types, user roles, and system settings

**Independent Test**: Admin can create a new leave type and verify it appears in employee request forms

### Implementation for User Story 5

- [x] T066 [P] [US5] Create admin dashboard layout in app/(dashboard)/admin/layout.tsx
- [x] T067 [P] [US5] Create user management components
- [x] T068 [P] [US5] Create leave type configuration forms
- [x] T069 [P] [US5] Create system settings components
- [x] T070 [P] [US5] Create API route for leave types in app/api/leave-types/route.ts
- [x] T071 [P] [US5] Create API route for user management in app/api/users/route.ts
- [x] T072 [P] [US5] Create API route for system settings in app/api/settings/route.ts
- [x] T073 [US5] Implement admin authorization middleware
- [x] T074 [US5] Add admin-specific audit logging
- [x] T075 [US5] Create admin pages for various configuration options

**Checkpoint**: Administrative features should be fully functional with proper restrictions

---

## Phase 8: User Story 6 - Real-time Notifications (Priority: P3) ✅ COMPLETE

**Goal**: Provide instant notifications for leave status changes and important events

**Independent Test**: Status change triggers immediate notification in recipient's interface

### Implementation for User Story 6

- [x] T076 [P] [US6] Create NotificationBell component in components/notifications/NotificationBell.tsx
- [x] T077 [P] [US6] Create NotificationDropdown component in components/notifications/NotificationDropdown.tsx
- [x] T078 [P] [US6] Create NotificationItem component in components/notifications/NotificationItem.tsx
- [x] T079 [P] [US6] Create NotificationPreferences component in components/notifications/NotificationPreferences.tsx
- [x] T080 [P] [US6] Create API route for notifications in app/api/notifications/route.ts
- [x] T081 [P] [US6] Create API route for marking notifications read in app/api/notifications/[id]/read/route.ts
- [x] T082 [P] [US6] Create API route for read all in app/api/notifications/read-all/route.ts
- [x] T083 [P] [US6] Create notification page in app/(dashboard)/notifications/page.tsx
- [x] T084 [US6] Implement real-time subscription service in lib/services/realtime.ts
- [x] T085 [US6] Update notification service with real-time broadcasting
- [x] T086 [P] [US6] Create test notification page in app/(dashboard)/test-notifications/page.tsx
- [x] T087 [P] [US6] Add notification types to lib/types/notification.ts
- [x] T088 [US6] Integrate notifications throughout all user stories

**Checkpoint**: All user stories should now have real-time notifications

---

## Phase 9: Database Performance Optimization

**Purpose**: Implement database indexes and monitoring for optimal performance

- [x] T089 [P] Create index on leaves(user_id, status) for fast employee queries
- [x] T090 [P] Create index on leaves(start_date, end_date) for date range queries
- [x] T091 [P] Create index on notification_logs(user_id, is_read) for notification queries
- [x] T092 [P] Create index on company_documents(category) for document filtering
- [x] T093 [P] Create index on audit_logs(user_id, created_at) for audit trail queries
- [x] T094 [P] Create partial index on leaves(status) WHERE status = 'PENDING' for manager queries
- [x] T095 Setup pg_stat_statements for query monitoring
- [x] T096 Implement cache hit rate monitoring (>99% target)
- [x] T097 Setup database connection pooling for 500 concurrent users
- [x] T098 Configure database bloat monitoring and maintenance

## Phase 10: Security Hardening

**Purpose**: Implement advanced security features based on Supabase best practices

- [x] T099 [P] Implement MFA (Multi-Factor Authentication) using Supabase Auth
- [x] T100 [P] Configure private realtime channels with RLS policies
- [x] T101 [P] Add JWT token validation for all API routes
- [x] T102 [P] Implement service role key access controls
- [x] T103 [P] Add rate limiting to API endpoints
- [x] T104 [P] Implement CSRF protection
- [ ] T136 [P] Implement MFA (Multi-Factor Authentication) using Supabase Auth
- [ ] T137 [P] Create comprehensive security test suite
- [ ] T138 [P] Implement SQL injection prevention tests
- [ ] T139 [P] Add XSS prevention validation
- [x] T105 [P] Add input sanitization for all user inputs
- [x] T106 [P] Configure secure headers (CSP, HSTS, etc.)
- [x] T107 [P] Implement session timeout and refresh
- [x] T108 [P] Add audit logging for all security events

## Phase 11: Testing Infrastructure ✅ COMPLETE

**Purpose**: Setup comprehensive testing based on requirements in spec.md

- [x] T109 [P] Configure Vitest for unit testing with 80% coverage target
- [x] T110 [P] Configure Playwright for E2E testing
- [x] T111 [P] Setup automated accessibility testing with axe-core
- [x] T112 [P] Configure ESLint with security rules
- [x] T113 [P] Setup automated vulnerability scanning
- [x] T114 [P] Create test data factories for consistent test environments
- [x] T115 [P] Configure CI/CD pipeline with automated tests
- [x] T116 [P] Setup test reporting and coverage tracking

---

## Phase 12: QA Infrastructure Implementation (4-6 weeks)

### Overview

Based on comprehensive test report (testsreport.md), the following QA infrastructure improvements are required to achieve production readiness:

**Current State**:

- Test Coverage: 0.96% (Target: 80%)
- TypeScript Errors: 500+ (Target: <50)
- ESLint Errors: 1,273 (Target: <50)
- E2E Tests: Complete failure
- Production Readiness: ❌ NOT PRODUCTION READY

### Phase 12.1: Test Framework Migration (Week 1)

- [ ] **T120 [P] Backup current Jest configuration**
- [ ] **T121 [P] Install Vitest and dependencies**
- [ ] **T122 [P] Create Vitest configuration with Next.js compatibility**
- [ ] **T123 [P] Create test-specific TypeScript configuration**
- [ ] **T124 [P] Update package.json with Vitest scripts**
- [ ] **T125 [P] Configure mock modules for Supabase and Next.js**
- [ ] **T126 [P] Create test utilities and fixtures**

### Phase 12.2: Code Quality Foundation (Week 1-2)

- [ ] **T127 [P] Analyze and categorize 500+ TypeScript errors**
- [ ] **T128 [P] Fix critical type definition errors**
- [ ] **T129 [P] Resolve Supabase client type issues**
- [ ] **T130 [P] Correct Prisma type definitions**
- [ ] **T131 [P] Fix component and hook type definitions**
- [ ] **T132 [P] Generate ESLint error report**
- [ ] **T133 [P] Apply automated ESLint fixes**
- [ ] **T134 [P] Fix complex ESLint violations**
- [ ] **T135 [P] Apply Prettier formatting consistency**

### Phase 12.3: Unit Test Implementation (Week 2-3)

- [ ] **T136 [P] Leave Balance Service Tests**
- [ ] **T137 [P] Conflict Detection Service Tests**
- [ ] **T138 [P] Notification Service Tests**
- [ ] **T139 [P] Date Utilities Tests**
- [ ] **T140 [P] Validation Utilities Tests**
- [ ] **T141 [P] LeaveRequestForm Component Tests**
- [ ] **T142 [P] DocumentUploadForm Component Tests**
- [ ] **T143 [P] NotificationBell Component Tests**
- [ ] **T144 [P] Calendar Component Tests**

### Phase 12.4: Integration Testing (Week 3)

- [ ] **T145 [P] Authentication Endpoints Tests**
- [ ] **T146 [P] Leave Management API Tests**
- [ ] **T147 [P] Notification Endpoints Tests**
- [ ] **T148 [P] Database Transaction Tests**
- [ ] **T149 [P] RLS Policy Tests**
- [ ] **T150 [P] Document Access Integration Tests**

### Phase 12.5: E2E Testing (Week 4)

- [ ] **T151 [P] Employee Leave Journey Tests**
- [ ] **T152 [P] Manager Approval Journey Tests**
- [ ] **T153 [P] Document Management Journey Tests**
- [ ] **T154 [P] Cross-Browser Compatibility Tests**
- [ ] **T155 [P] Mobile Responsive Tests**

### Phase 12.6: Accessibility & Performance Testing (Week 4-5)

- [ ] **T156 [P] Automated axe-playwright Testing**
- [ ] **T157 [P] Keyboard Navigation Tests**
- [ ] **T158 [P] Screen Reader Testing**
- [ ] **T159 [P] API Load Tests**
- [ ] **T160 [P] Bundle Size Analysis**
- [ ] **T161 [P] Core Web Vitals Testing**

### Phase 12.7: Security & Compliance Testing (Week 5)

- [ ] **T162 [P] JWT Token Validation Tests**
- [ ] **T163 [P] SQL Injection Prevention Tests**
- [ ] **T164 [P] XSS Prevention Tests**
- [ ] **T165 [P] CSRF Protection Tests**
- [ ] **T166 [P] MFA Implementation**
- [ ] **T167 [P] Audit Trail Validation**
- [ ] **T168 [P] Data Privacy Compliance Tests**

### Phase 12.8: Production Readiness (Week 5-6)

- [ ] **T169 [P] CI/CD Quality Gates Implementation**
- [ ] **T170 [P] Automated Testing Pipeline Optimization**
- [ ] **T171 [P] Production Environment Configuration**
- [ ] **T172 [P] Monitoring and Alerting Setup**
- [ ] **T173 [P] Technical Documentation Updates**
- [ ] **T174 [P] Deployment Runbook Creation**
- [ ] **T175 [P] Team Training Materials Development**

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect multiple user stories

- [x] T117 [P] Update all pages with proper SEO metadata
- [x] T118 [P] Add loading skeletons for better UX
- [x] T119 [P] Implement error boundaries for graceful error handling
- [x] T120 [P] Add focus management for accessibility
- [x] T121 [P] Optimize images and assets
- [x] T122 [P] Add keyboard navigation support
- [x] T123 Implement global search functionality
- [x] T124 [P] Create GlobalSearch component in components/search/GlobalSearch.tsx
- [x] T125 [P] Create AdvancedFilters component in components/search/AdvancedFilters.tsx
- [x] T126 [P] Create SearchPresets component in components/search/SearchPresets.tsx
- [x] T127 [P] Create API route for search in app/api/search/route.ts
- [x] T128 [P] Create search page in app/search/page.tsx
- [x] T129 Add analytics and reporting features
- [x] T130 [P] Create dashboard widgets in components/analytics/
- [ ] T131 Update README with comprehensive documentation
- [ ] T132 [P] Create deployment documentation
- [ ] T133 Run full accessibility audit
- [ ] T134 Run performance optimization
- [ ] T135 Create deployment scripts

---

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5 → US6)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Integrates with US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational - May read data from US1/US2
- **User Story 4 (P2)**: Can start after Foundational - Independent functionality
- **User Story 5 (P3)**: Can start after Foundational - Affects all stories but not required for basic operation
- **User Story 6 (P3)**: Can start after Foundational - Enhances all stories

### Within Each User Story

- Component creation before service integration
- Services before API routes
- API routes before page implementation
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel
- Components within a story marked [P] can run in parallel
- API routes within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all component creation for User Story 1 together:
Task: "Create LeaveRequestForm component in components/forms/LeaveRequestForm.tsx"
Task: "Create LeaveStatusBadge component in components/employee/LeaveStatusBadge.tsx"
Task: "Create leave validation schema in lib/validations/leave.ts"
Task: "Implement leave balance calculation service in lib/services/leave-balance.ts"

# Launch all API routes for User Story 1 together:
Task: "Create API route for leave submissions in app/api/leaves/route.ts"
Task: "Create API route for leave listing in app/api/leaves/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Complete Phase 9: Polish → Final deployment

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 & 2 (P1 priorities)
   - Developer B: User Story 3 & 4 (P2 priorities)
   - Developer C: User Story 5 & 6 (P3 priorities)
3. Stories complete and integrate independently
4. Team converges for Phase 9: Polish

---

## Summary

- **Total Tasks**: 135 tasks
- **Tasks per User Story**:
  - US1 (Employee Leave Request): 11 tasks
  - US2 (Manager Approval): 11 tasks
  - US3 (Team Calendar): 10 tasks
  - US4 (Document Management): 16 tasks
  - US5 (Admin Configuration): 10 tasks
  - US6 (Notifications): 13 tasks
- **Setup Tasks**: 7 tasks
- **Foundational Tasks**: 10 tasks
- **Database Performance Tasks**: 10 tasks
- **Security Hardening Tasks**: 10 tasks
- **Testing Infrastructure Tasks**: 8 tasks
- **Polish Tasks**: 19 tasks
- **Parallel Opportunities**: 115 tasks marked as parallelizable
- **Independent Test Criteria**: Each user story has clear independent test criteria
- **Suggested MVP Scope**: User Story 1 only (11 implementation tasks after foundation)
- **Latest Enhancements**: Added database optimization, security hardening, and testing infrastructure tasks based on Supabase best practices

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
