# Product Requirements Document: Leave Management System

## 1. Introduction

### 1.1 Goal

The primary goal is to deliver a comprehensive, secure, and user-friendly platform for managing company leave, including requests, approvals, tracking, and document handling. The system will streamline administrative tasks, ensure regulatory compliance, and provide real-time visibility into team availability.

### 1.2 Target Audience

| Role         | Primary Functions                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Employee** | Submit and track personal leave requests; view team calendar; manage personal documents; view notifications.                         |
| **Manager**  | Review, approve, and reject team leave requests; view team calendar; access team reports.                                            |
| **Admin/HR** | Full system configuration (leave types, user roles); comprehensive reporting; user management; document management; system auditing. |

---

## 2. Features

### 2.1 Core Business Features

| Feature                              | Description                                                                                                           | Supabase/Prisma Integration                                                                                           |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Authentication & User Management** | Secure login and registration with Role-Based Access Control (RBAC) (Employee, Manager, Admin, HR).                   | Supabase Auth handles sign-up/login. User roles stored in `profiles` table, accessed via Prisma.                      |
| **Leave Request Management**         | Submit, track, and manage leave requests; automatic balance calculation and validation; multi-step approval workflow. | `leaves` and `leave_types` tables managed by Prisma. Approval logic run in Supabase Edge Functions.                   |
| **Document Management**              | Secure upload, storage, categorization, metadata tagging, and expiry date tracking with automated notifications.      | Supabase Storage (S3-compatible) for file handling. Document metadata stored in `company_documents` table via Prisma. |
| **Team Calendar**                    | Visual interface for viewing team availability and scheduling conflicts.                                              | Reads from the `leaves` table using efficient Prisma queries.                                                         |
| **Admin Dashboard & Reporting**      | Administrative tools for user role assignment and detailed reporting on leave utilization.                            | Complex reporting queries optimized using Prisma's query engine.                                                      |
| **Real-time Notifications**          | Instant updates for leave status changes, new requests, and document expiry warnings.                                 | Supabase Realtime subscribes to changes on the `leaves` and `document_notifiers` tables.                              |

### 2.2 User Experience (UX) Features

- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices (using Next.js and Tailwind CSS).

- **Advanced Theme System**: Multiple theme options with sophisticated visual design:
  - **Dark Mode (Default)**: Deep backgrounds with subtle gradients and glassmorphism effects
  - **Light Mode**: Clean, bright interface with gradient accents and frosted glass components
  - **Gradient Backgrounds**: Dynamic, smooth color gradients that enhance visual depth
  - **Glassmorphism Design**: Frosted glass effect on cards, modals, and overlays with:
    - Semi-transparent backgrounds with backdrop blur
    - Subtle borders and shadows
    - Layered depth for improved visual hierarchy
    - Smooth transitions between states

- **Component Library**: Leveraging shadcn/ui for consistent, accessible UI components including:
  - Forms (input fields, selects, date pickers, textareas)
  - Data display (tables, cards, badges, avatars)
  - Navigation (menus, tabs, breadcrumbs)
  - Feedback (alerts, toasts, dialogs, tooltips)
  - Overlays (modals, popovers, dropdown menus)
  - All components enhanced with glassmorphism effects and gradient accents

---

## 3. Technical Specifications

### 3.1 Tech Stack

| Component                   | Technology                          | Role                                                                                       |
| --------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ |
| **Frontend Framework**      | Next.js 14 (App Router)             | React framework for routing, server-side capabilities, and API integration.                |
| **UI Library**              | React 18, TypeScript                | UI development with robust type safety.                                                    |
| **UI Components**           | shadcn/ui                           | High-quality, accessible, customizable React components built on Radix UI primitives.      |
| **Styling**                 | Tailwind CSS                        | Utility-first CSS framework for rapid UI development and consistent design.                |
| **State/Forms**             | React Query, React Hook Form, Zod   | Data fetching/caching; Declarative form handling; Schema validation.                       |
| **Database**                | PostgreSQL                          | Primary relational database (hosted by Supabase).                                          |
| **ORM & Data Access**       | Prisma                              | Object-Relational Mapper for type-safe database access, schema definition, and migrations. |
| **Backend Services (BaaS)** | Supabase                            | All-in-one Backend-as-a-Service for Auth, Storage, Edge Functions, and Realtime.           |
| **API Layer**               | Next.js API Routes / Server Actions | Handles all data fetching and mutations, using Prisma Client to interact with PostgreSQL.  |

### 3.2 Supabase + Prisma Integration

This architecture provides an integrated yet separated stack:

- **Database Connection**: Next.js Server Components/Actions use the Prisma Client to connect directly to the Supabase-hosted PostgreSQL database.
- **Auth & Roles**: Supabase Auth manages user sessions and issues JWTs. The user ID from the JWT is used in conjunction with Prisma queries to enforce access policies.
- **Security**: PostgreSQL Row Level Security (RLS) is enabled on all tables (e.g., `leaves`, `profiles`) and is configured and managed via the Supabase dashboard.
- **Backend Logic**: Complex business logic (e.g., final approval, external service calls) is handled by Supabase Edge Functions (written in TypeScript/Deno).

---

## 4. Key Data Models (Prisma Schema)

The core application data models will be defined in the `schema.prisma` file, which maps directly to the PostgreSQL tables:

- **User / Profile**: Stores user details, their assigned role (`role: String` - Employee, Manager, Admin, HR), and department.
- **Leave**: Stores the details of a leave request, including type, start/end dates, status, `user_id`, `manager_id`, and approval comments.
- **LeaveType**: Configurable types of leave (e.g., Annual, Sick), their annual allocation, and approval rules.
- **CompanyDocument**: Metadata for uploaded files (stored in Supabase Storage), including file path, category, and `expiry_date`.
- **NotificationLog**: Stores records of real-time events and user notifications.

---

## 5. Security Requirements

- **Row Level Security (RLS)**: Must be enabled and configured on Supabase for all data tables. Prisma queries will respect these policies, ensuring users only retrieve data they are authorized to see.
- **JWT Protection**: All server-side data access must validate the user's JWT provided by Supabase Auth.
- **Input Validation**: All form data and API inputs must be strictly validated using Zod schema validation.
- **Secure Storage**: Document uploads utilize Supabase Storage buckets with granular access policies to protect sensitive files.

---

## 6. Development & Deployment

### 6.1 Development Scripts (Prisma & Supabase CLI)

The development lifecycle will heavily rely on the integration of the two CLIs:

- `npm run db:generate`: Uses the Prisma CLI to generate the type-safe Prisma Client from the `schema.prisma` file.
- `npm run db:push`: Uses the Prisma CLI to push schema changes directly to the Supabase database during development.
- `npm run db:migrate`: Uses the Supabase CLI (or Prisma CLI) for production-ready schema migrations.

### 6.2 Deployment

The frontend is deployed on Vercel/Netlify. The backend services (PostgreSQL, Auth, Storage, Edge Functions) are fully managed by Supabase, offering inherent scalability and reliability.
