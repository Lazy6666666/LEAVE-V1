# Gemini Project Context: Leave Management System

## Project Overview

This is a modern, full-stack leave management system built with a robust and type-safe stack. The application provides comprehensive features for tracking employee leave, managing roles and permissions, handling documents, and maintaining a complete audit trail.

### Core Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (managed via Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth with Row-Level Security (RLS)
- **UI**: React 18 with Server Components (RSC)
- **Styling**: Tailwind CSS
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Testing**: Vitest (unit/integration), Playwright (end-to-end)
- **Code Quality**: ESLint, Prettier, Knip (for unused code detection)

### Key Features

- **Leave Management**: Full workflow for requesting, approving, and tracking various leave types.
- **Role-Based Access Control (RBAC)**: Four distinct roles (Employee, Manager, HR, Admin) with granular permissions.
- **Document Storage**: Securely upload and manage company documents.
- **Notifications & Auditing**: In-app notifications and a comprehensive audit log for all system actions.
- **Database Schema**: A well-defined Prisma schema (`prisma/schema.prisma`) models the application's data, including users, profiles, leave, documents, and system settings.

## Getting Started

### Initial Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Configure Environment**:
    - Copy `.env.local.example` to `.env.local`.
    - Fill in the required Supabase and database credentials as described in `README.md`.
3.  **Database Setup**:
    - This command generates the Prisma client, runs migrations, and seeds the database with initial data.
    ```bash
    npm run db:setup
    ```

### Running the Application

- **Development**: Start the development server.
  ```bash
  npm run dev
  ```
- **Production Build**: Create a production-ready build.
  ```bash
  npm run build
  ```
- **Start Production Server**:
  ```bash
  npm run start
  ```

## Development Conventions

### Project Structure

The project uses the Next.js App Router structure.

- `app/`: Contains all routes, pages, and layouts.
  - `app/(auth)/`: Authentication-related pages.
  - `app/(dashboard)/`: Protected dashboard pages.
  - `app/api/`: API routes.
- `components/`: Shared React components, organized by feature.
  - `components/ui/`: Contains `shadcn/ui` components.
- `lib/`: Core application logic, utilities, and services.
  - `lib/auth/`: Authentication and session management.
  - `lib/prisma.ts`: Prisma client instance.
  - `lib/supabase/`: Supabase client instances.
- `prisma/`: Database-related files.
  - `schema.prisma`: The single source of truth for the database schema.
  - `seed.ts`: Script for populating the database with initial data.
  - `migrations/`: Database migration history.

### Database

- All database schema changes should be made in `prisma/schema.prisma`.
- To create and apply a new migration: `npx prisma migrate dev --name <migration-name>`
- To update the Prisma client after a schema change: `npx prisma generate`
- The database can be visually explored using Prisma Studio: `npx prisma studio`

### Testing

The project has a comprehensive testing setup.

- **Unit & Integration Tests**: Written with Vitest. Run with `npm test`.
- **End-to-End Tests**: Written with Playwright. Run with `npm run test:e2e`.
- **Validation**: To run all checks (types, linting, formatting, tests), use `npm run validate:all`.

### UI and Styling

- The UI is built using `shadcn/ui` components, which are highly customizable.
- New components can be added via the CLI: `npx shadcn-ui@latest add <component-name>`
- Global styles and Tailwind CSS variables are defined in `app/globals.css`.
- Tailwind configuration is in `tailwind.config.ts`.
