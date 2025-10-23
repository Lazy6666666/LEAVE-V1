<!-- Sync Impact Report:
Version change: 0.0.0 → 1.0.0 (Initial constitution creation)
Modified principles: N/A (new constitution)
Added sections: Core Principles, Security & Access Control, Performance & Accessibility, Development Workflow, Governance
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md (already aligned with project structure)
  ✅ spec-template.md (already aligned with user story format)
  ✅ tasks-template.md (already aligned with task organization)
  ⚠ command files may need references updated to reflect new principles
Follow-up TODOs: N/A
-->

# Leave Management System Constitution

## Core Principles

### I. Security-First Development

Authentication and authorization MUST be implemented at every layer. All data access MUST enforce Row Level Security (RLS) policies. Role-based access control (RBAC) MUST be validated server-side before any operation. Sensitive operations MUST use server actions and never bypass security controls.

### II. TypeScript Everywhere

All code MUST be written in TypeScript with strict type checking enabled. Database schema MUST be type-safe through Prisma. API endpoints MUST validate input types. Components MUST be fully typed with proper props interfaces. No `any` types allowed without explicit justification.

### III. Performance by Design

Components MUST be optimized for performance from inception. Lazy loading MUST be used for heavy components. React Query MUST handle all server state with optimized caching. Bundle size MUST be monitored regularly. Tree-shakeable imports MUST be preferred over full library imports.

### IV. Accessibility as a Requirement

All features MUST be accessible following WCAG 2.1 AA standards. Semantic HTML MUST be used appropriately. ARIA labels MUST be provided where needed. Keyboard navigation MUST work for all interactive elements. Focus indicators MUST have 3:1 contrast ratio. Screen reader testing MUST be performed.

### V. Real-Time User Experience

Critical user actions MUST provide immediate feedback through real-time updates. Notifications MUST use Supabase Realtime subscriptions. Form validations MUST be immediate and clear. Loading states MUST be informative. Error messages MUST be actionable.

## Security & Access Control

### Authentication Architecture

Supabase Auth MUST be used for all authentication needs. Server-side and client-side clients MUST be properly separated. Middleware MUST protect all authenticated routes. Session management MUST handle automatic refresh.

### Data Protection

Row Level Security (RLS) MUST enforce data access at database level. Audit logs MUST track all sensitive operations. Password handling MUST use Supabase's secure hashing. HTTPS MUST be enforced in production. Environment variables MUST never be exposed to client-side.

### Permission System

Four roles MUST be enforced: EMPLOYEE, MANAGER, HR, ADMIN. Permissions MUST be granular and defined in `lib/rbac/permissions.ts`. Role checks MUST happen server-side for sensitive operations. Role escalation MUST require proper authorization.

## Performance & Accessibility

### Performance Standards

Page load MUST be under 3 seconds on 3G. Component rendering MUST not block main thread. Database queries MUST be optimized with proper indexes. Images MUST be optimized and served in next-gen formats. Bundle size MUST be under 1MB initial load.

### Accessibility Requirements

Skip navigation links MUST be present in root layout. Color contrast MUST meet WCAG AA standards. All images MUST have alt text. Forms MUST have proper labels and error descriptions. Motion MUST respect prefers-reduced-motion.

## Development Workflow

### Code Quality Standards

ESLint MUST be configured and errors fixed before commits. Prettier MUST format all code. TypeScript MUST pass strict type checking. Code review MUST verify compliance with all principles.

### Database Operations

Prisma migrations MUST be used for all schema changes. Database setup MUST use `npm run db:setup`. RLS policies MUST be tested with different user roles. Seed data MUST be consistent and realistic.

### Testing Requirements

Unit tests MUST cover business logic. Integration tests MUST cover API endpoints. End-to-end tests MUST cover critical user journeys. Accessibility tests MUST use automated tools. Performance tests MUST verify bundle size limits.

## Governance

This constitution supersedes all other development practices and guidelines. All pull requests MUST verify compliance with these principles. Amendments MUST follow semantic versioning: MAJOR for backward-incompatible changes, MINOR for new principles or sections, PATCH for clarifications. Version MUST increment accordingly when amendments are made.

Complexity deviations from these principles MUST be explicitly justified in design documents with rationale and simpler alternatives considered and rejected. For runtime development guidance, refer to `CLAUDE.md` and `SETUP.md`.

**Version**: 1.0.0 | **Ratified**: 2025-01-20 | **Last Amended**: 2025-01-20
