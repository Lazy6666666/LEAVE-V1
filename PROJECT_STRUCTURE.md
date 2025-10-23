# Project Structure

This document outlines the complete folder structure for the Leave Management System.

## Directory Layout

```
C:\Users\Twisted\Desktop\LEAVE\
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication route group
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── (dashboard)/             # Dashboard route group
│   │   ├── employee/            # Employee dashboard
│   │   ├── manager/             # Manager dashboard
│   │   └── admin/               # Admin dashboard
│   ├── api/                     # API routes
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── ui/                      # UI components (shadcn/ui - to be added)
│   ├── forms/                   # Form components
│   └── layouts/                 # Layout components
│
├── lib/                         # Utility libraries
│   ├── utils/                   # Utility functions
│   └── validations/             # Form validation schemas
│
├── types/                       # TypeScript type definitions
│
├── prisma/                      # Prisma ORM (to be configured)
│
├── public/                      # Static assets
│
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── .prettierignore             # Prettier ignore rules
├── .gitignore                  # Git ignore rules
├── .env.local.example          # Environment variables template
├── tsconfig.json               # TypeScript configuration
├── next.config.js              # Next.js configuration
├── package.json                # Project dependencies
└── README.md                   # Project documentation
```

## Configuration Details

### TypeScript (tsconfig.json)

- Strict mode enabled
- Additional strict checks: noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch
- Path aliases configured: @/_ maps to ./_

### ESLint (.eslintrc.json)

- Extends: next/core-web-vitals, next/typescript, prettier
- Rules: prettier/prettier, no-unused-vars, no-explicit-any

### Prettier (.prettierrc)

- Semi: true
- Single quotes: false
- Print width: 80
- Tab width: 2
- End of line: lf

### Package Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format with Prettier
- `npm run format:check` - Check formatting
- `npm run type-check` - TypeScript type checking

## Dependencies

### Production

- next@14 - Next.js framework
- react@18 - React library
- react-dom@18 - React DOM
- typescript - TypeScript
- @types/react - React types
- @types/react-dom - React DOM types
- @types/node - Node.js types
- eslint-config-next - Next.js ESLint config

### Development

- eslint@8 - Linter
- eslint-config-prettier - Prettier ESLint config
- eslint-plugin-prettier - Prettier ESLint plugin
- prettier - Code formatter

## Next Steps

This is the base project structure. The following will be added in subsequent streams:

1. **Stream A (Backend/Database):**
   - Supabase authentication setup
   - Prisma schema configuration
   - Database migrations
   - API routes

2. **Stream B (Frontend/UI):**
   - shadcn/ui components
   - Form components
   - Dashboard layouts
   - Authentication pages

3. **Stream C (Features):**
   - Leave request workflows
   - Role-based access control
   - Approval workflows
   - Reporting features
