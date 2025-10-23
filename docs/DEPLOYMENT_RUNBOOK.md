# Leave Management System - Deployment Runbook

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Vercel Deployment](#vercel-deployment)
6. [Environment Variables Configuration](#environment-variables-configuration)
7. [Domain Configuration](#domain-configuration)
8. [SSL/HTTPS Setup](#sslhttps-setup)
9. [Post-Deployment Verification](#post-deployment-verification)
10. [Monitoring and Logging](#monitoring-and-logging)
11. [Backup and Recovery](#backup-and-recovery)
12. [Rollback Procedures](#rollback-procedures)
13. [Troubleshooting Guide](#troubleshooting-guide)
14. [Maintenance Procedures](#maintenance-procedures)

---

## Deployment Overview

This deployment runbook provides step-by-step instructions for deploying the Leave Management System to production on Vercel. The system is built using Next.js 14, uses Supabase as the database/backend, and is optimized for performance and scalability.

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel Edge   │────│  Next.js App    │────│   Supabase      │
│   (CDN)         │    │  (Frontend)     │    │  (Database)     │
│                 │    │                 │    │                 │
│ • Global CDN    │    │ • SSR/SSG       │    │ • PostgreSQL    │
│ • Edge Functions│    │ • API Routes    │    │ • Auth          │
│ • Caching       │    │ • Static Assets │    │ • Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Deployment Components

- **Frontend**: Next.js 14 application with React components
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **Hosting**: Vercel (Edge deployment, global CDN)
- **DNS**: Custom domain configuration
- **SSL**: Automatic HTTPS through Vercel
- **Monitoring**: Vercel Analytics and error tracking

### Deployment Environments

- **Development**: Local development environment
- **Staging**: Testing environment (staging.yourdomain.com)
- **Production**: Live production environment (yourdomain.com)

---

## Prerequisites

### Required Accounts and Services

#### 1. Vercel Account

- **Account**: https://vercel.com/
- **Plan**: Pro plan recommended for production
- **GitHub Integration**: Connect to your repository
- **Team Setup**: Configure team members and permissions

#### 2. Supabase Project

- **Account**: https://supabase.com/
- **Project**: Create new PostgreSQL project
- **Configuration**: Set up authentication and storage
- **API Keys**: Generate and secure API keys

#### 3. Domain Name (Optional)

- **Provider**: Any domain registrar (GoDaddy, Namecheap, etc.)
- **DNS Configuration**: Configure DNS records
- **SSL**: Automatic SSL provided by Vercel

#### 4. GitHub Repository

- **Repository**: Code must be in GitHub
- **Branching**: Main branch for production
- **CI/CD**: Connected to Vercel for automatic deployments

### Technical Requirements

#### Development Environment

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **Git**: Latest version
- **IDE**: VS Code or similar code editor

#### System Access

- **Repository Access**: Admin access to GitHub repository
- **Vercel Access**: Admin access to Vercel account
- **Supabase Access**: Admin access to Supabase project
- **Domain Access**: Admin access to domain registrar

---

## Environment Setup

### Local Development Setup

#### 1. Clone Repository

```bash
git clone https://github.com/yourcompany/leave-management-system.git
cd leave-management-system
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Environment Configuration

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your local development values:

```env
# Database
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[your-secret]"
```

#### 4. Database Setup

```bash
npm run db:setup
```

#### 5. Start Development Server

```bash
npm run dev
```

### Production Environment Setup

#### 1. Vercel Project Setup

1. **Import Project**: Go to Vercel dashboard and import your GitHub repository
2. **Configure Settings**:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### 2. Supabase Production Setup

1. **Create Project**: Create new Supabase project for production
2. **Database Schema**: Apply migrations using `npm run prisma:migrate:prod`
3. **Seed Data**: Load initial data using `npm run db:seed`
4. **Authentication**: Configure auth settings and providers

---

## Database Setup

### Supabase Project Configuration

#### 1. Create Supabase Project

1. Go to https://supabase.com/
2. Click "New Project"
3. Enter project details:
   - **Organization**: Your company name
   - **Project Name**: leave-management-prod
   - **Database Password**: Generate strong password
   - **Region**: Choose nearest region to your users
4. Wait for project creation (2-3 minutes)

#### 2. Database Schema Setup

##### Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref [your-project-ref]

# Apply migrations
supabase db push
```

##### Verify Schema

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check users table
SELECT * FROM users LIMIT 1;

-- Check leave requests table
SELECT * FROM leave_requests LIMIT 1;
```

#### 3. Authentication Configuration

##### Configure Auth Settings

1. **Go to Supabase Dashboard** → Authentication → Settings
2. **Site URL**: `https://yourdomain.com`
3. **Redirect URLs**:
   - `https://yourdomain.com/api/auth/callback`
   - `http://localhost:3000/api/auth/callback` (for development)

##### Enable Auth Providers

1. **Email Provider**: Enable email authentication
2. **Social Providers**: Configure Google, GitHub, etc. (optional)
3. **Custom SMTP**: Configure custom email provider (optional)

#### 4. Row Level Security (RLS)

##### Enable RLS on Tables

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (examples)
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can only view their own leave requests
CREATE POLICY "Users can view own requests" ON leave_requests
  FOR SELECT USING (auth.uid() = user_id);
```

#### 5. Storage Configuration

##### Create Storage Buckets

```sql
-- Create buckets for document storage
INSERT INTO storage.buckets (id, name, public) VALUES
  ('documents', 'documents', false),
  ('avatars', 'avatars', true);

-- Set up storage policies
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Vercel Deployment

### Step-by-Step Deployment Process

#### 1. Connect Repository to Vercel

1. **Login to Vercel**: https://vercel.com/
2. **Add New Project**: Click "Add New..." → "Project"
3. **Import Git Repository**: Choose your GitHub repository
4. **Configure Project**:
   - **Project Name**: leave-management-system
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### 2. Configure Environment Variables

##### Add Environment Variables in Vercel

1. **Go to Project Settings** → Environment Variables
2. **Add the following variables**:

```env
# Supabase Configuration
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"

# Next.js Configuration
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="[your-secure-secret]"
NODE_ENV="production"

# Optional: Additional configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="[your-app-password]"
```

#### 3. Build and Deploy

##### Automatic Deployment

- **Trigger**: Push to main branch
- **Process**: Vercel automatically builds and deploys
- **Duration**: 3-5 minutes typically

##### Manual Deployment

```bash
# Push to main branch
git add .
git commit -m "Deploy to production"
git push origin main

# Or use Vercel CLI
npm install -g vercel
vercel --prod
```

#### 4. Monitor Deployment Progress

##### Vercel Dashboard

1. **Go to your project dashboard**
2. **View Builds**: Monitor build progress
3. **Check Logs**: Review build logs for any errors
4. **Functions**: Monitor serverless function performance

##### Build Status Indicators

- **🟡 Building**: Build in progress
- **🟢 Ready**: Deployment successful
- **🔴 Error**: Build failed (check logs)

---

## Environment Variables Configuration

### Environment Variables Guide

#### Required Variables

##### Database Configuration

```env
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

- **Purpose**: Primary database connection string
- **Source**: Supabase project settings
- **Security**: Never commit to version control

##### Supabase Configuration

```env
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"
```

- **Purpose**: Supabase API access
- **Source**: Supabase project API settings
- **Note**: PUBLIC keys are safe for client-side, SERVICE_ROLE for server-side only

##### Next.js Configuration

```env
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="[your-secure-secret]"
NODE_ENV="production"
```

- **Purpose**: Next.js authentication and configuration
- **NEXTAUTH_SECRET**: Generate using `openssl rand -base64 32`
- **NODE_ENV**: Set to "production" for production deployment

#### Optional Variables

##### Email Configuration

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="[your-app-password]"
EMAIL_FROM="Leave Management <noreply@yourdomain.com>"
```

##### Analytics and Monitoring

```env
VERCEL_ANALYTICS_ID="[your-analytics-id]"
SENTRY_DSN="[your-sentry-dsn]"
GOOGLE_ANALYTICS_ID="[your-ga-id]"
```

##### Feature Flags

```env
ENABLE_FEATURE_X="true"
BETA_FEATURES="false"
MAINTENANCE_MODE="false"
```

### Security Best Practices

#### Variable Security

1. **Never Commit**: Never commit `.env` files to version control
2. **Use Different Keys**: Use different keys for different environments
3. **Regular Rotation**: Rotate secrets regularly
4. **Principle of Least Privilege**: Grant minimum necessary permissions

#### Environment-Specific Configuration

- **Development**: `.env.local`
- **Production**: Vercel Environment Variables
- **Testing**: `.env.test`

---

## Domain Configuration

### Custom Domain Setup

#### 1. Purchase Domain

1. **Choose Registrar**: GoDaddy, Namecheap, Google Domains, etc.
2. **Purchase Domain**: Buy your desired domain name
3. **Access DNS Settings**: Log in to domain registrar dashboard

#### 2. Configure DNS in Vercel

1. **Go to Vercel Dashboard** → Project Settings → Domains
2. **Add Custom Domain**: Enter your domain name (e.g., `yourdomain.com`)
3. **Verify Ownership**: Follow Vercel's verification process
4. **DNS Records**: Vercel will provide DNS records to add

#### 3. Update DNS Records

##### Required DNS Records

```
Type: A
Name: @ (or your domain name)
Value: 76.76.21.21 (Vercel's IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

##### Example for GoDaddy

1. **Log in** to GoDaddy DNS management
2. **Add A Record**:
   - Type: A
   - Name: @
   - Value: 76.76.21.21
   - TTL: 600
3. **Add CNAME Record**:
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com
   - TTL: 600

#### 4. Verify Domain

1. **Wait for Propagation**: DNS changes may take 5-30 minutes
2. **Check Status**: Vercel will show verification status
3. **Test Access**: Visit your domain to confirm it's working

### Subdomain Configuration

#### Setting Up Subdomains

```
# Application (main domain)
yourdomain.com → Vercel deployment

# API (optional)
api.yourdomain.com → Vercel deployment

# Staging (optional)
staging.yourdomain.com → Separate Vercel project

# Documentation (optional)
docs.yourdomain.com → Vercel deployment
```

#### DNS Configuration for Subdomains

```
Type: CNAME
Name: api
Value: cname.vercel-dns.com

Type: CNAME
Name: staging
Value: cname.vercel-dns.com
```

---

## SSL/HTTPS Setup

### Automatic SSL Configuration

#### Vercel SSL

- **Automatic**: Vercel provides free SSL certificates
- **Managed**: Certificates are automatically renewed
- **Global**: All edge locations have SSL termination

#### SSL Certificate Process

1. **Domain Verification**: Vercel verifies domain ownership
2. **Certificate Issuance**: SSL certificate issued automatically
3. **Installation**: Certificate installed on all edge servers
4. **Renewal**: Automatic renewal before expiration

### SSL Best Practices

#### Security Headers

Vercel automatically adds security headers:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

#### Certificate Configuration

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};
```

---

## Post-Deployment Verification

### Deployment Checklist

#### 1. Application Access

- [ ] **Homepage Loads**: Visit `https://yourdomain.com`
- [ ] **All Pages Load**: Test main navigation pages
- [ ] **No Console Errors**: Check browser console for errors
- [ ] **Mobile Responsive**: Test on mobile devices

#### 2. Authentication Testing

- [ ] **User Registration**: Test new user signup
- [ ] **User Login**: Test login functionality
- [ ] **Password Reset**: Test password recovery
- [ ] **Session Management**: Test session persistence

#### 3. Core Functionality

- [ ] **Leave Request Creation**: Test creating leave requests
- [ ] **Approval Workflow**: Test approval process
- [ ] **Dashboard Loading**: Test dashboard functionality
- [ ] **Calendar Integration**: Test calendar features

#### 4. Database Connectivity

- [ ] **Database Connection**: Verify database connectivity
- [ ] **Data Persistence**: Test data saving and retrieval
- [ ] **User Data**: Verify user data is stored correctly
- [ ] **Leave Requests**: Verify requests are saved properly

#### 5. External Integrations

- [ ] **Email Notifications**: Test email sending
- [ ] **File Uploads**: Test document upload functionality
- [ ] **API Integration**: Test any external API calls
- [ ] **Third-party Services**: Verify service integrations

### Performance Testing

#### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery run load-test-config.yml
```

#### Example Load Test Configuration

```yaml
# load-test-config.yml
config:
  target: "https://yourdomain.com"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/"
      - think: 2
      - get:
          url: "/api/v1/dashboard"
```

#### Performance Monitoring

- **Vercel Analytics**: Monitor performance metrics
- **Lighthouse Score**: Run Lighthouse audits
- **Core Web Vitals**: Monitor CWV scores
- **Page Load Times**: Track page load performance

### User Acceptance Testing (UAT)

#### UAT Test Plan

1. **Create Test Accounts**: Set up test user accounts
2. **Test User Journeys**: Test complete user workflows
3. **Cross-browser Testing**: Test on different browsers
4. **Device Testing**: Test on various devices
5. **Accessibility Testing**: Verify WCAG compliance

#### Test Scenarios

- **Employee Journey**: Complete leave request process
- **Manager Journey**: Approval workflow testing
- **Admin Journey**: Administrative functions testing
- **Error Scenarios**: Test error handling and recovery

---

## Monitoring and Logging

### Vercel Analytics

#### Setup Analytics

1. **Enable Analytics**: Go to Vercel Dashboard → Analytics
2. **Install Tracking Code**: Add analytics script to app
3. **Configure Goals**: Set up conversion tracking
4. **Custom Events**: Track custom user events

```javascript
// lib/analytics.js
import { Analytics } from "@vercel/analytics/react";

export function AnalyticsProvider() {
  return <Analytics />;
}
```

#### Key Metrics to Monitor

- **Page Views**: Track page visitation
- **User Sessions**: Monitor user engagement
- **Conversion Rates**: Track goal completion
- **Performance Metrics**: Monitor site performance

### Error Tracking

#### Sentry Integration

1. **Create Sentry Project**: https://sentry.io/
2. **Install Sentry SDK**:
   ```bash
   npm install @sentry/nextjs
   ```
3. **Configure Sentry**:

   ```javascript
   // sentry.client.config.js
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
   });
   ```

#### Custom Error Logging

```javascript
// utils/error-logging.js
export function logError(error, context) {
  console.error("Application Error:", error, context);

  // Send to error tracking service
  if (typeof window !== "undefined") {
    // Client-side error tracking
  }
}
```

### Performance Monitoring

#### Core Web Vitals

```javascript
// next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
};
```

#### Custom Performance Metrics

```javascript
// lib/performance.js
export function trackPageLoad(page) {
  const startTime = performance.now();

  window.addEventListener("load", () => {
    const loadTime = performance.now() - startTime;
    console.log(`Page ${page} loaded in ${loadTime}ms`);

    // Send to analytics
    analytics.track("page_load_time", {
      page,
      loadTime,
    });
  });
}
```

### Log Management

#### Application Logging

```javascript
// lib/logger.js
export const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({ level: "info", message, ...meta }));
  },

  error: (message, error, meta = {}) => {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        error: error.message,
        stack: error.stack,
        ...meta,
      })
    );
  },

  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({ level: "warn", message, ...meta }));
  },
};
```

#### Vercel Logs

1. **Access Logs**: Monitor Vercel access logs
2. **Function Logs**: Check serverless function logs
3. **Build Logs**: Review build and deployment logs
4. **Error Logs**: Monitor application error logs

---

## Backup and Recovery

### Database Backup Strategy

#### Supabase Backups

1. **Automatic Backups**: Supabase provides automatic daily backups
2. **Point-in-Time Recovery**: 7-day PITR available
3. **Manual Backups**: Create manual backups before major changes

##### Manual Backup Process

```bash
# Using Supabase CLI
supabase db dump --data-only > backup-$(date +%Y%m%d).sql

# Restore from backup
supabase db restore backup-20251020.sql
```

#### Backup Verification

1. **Regular Testing**: Test backup restoration monthly
2. **Data Integrity**: Verify backup data integrity
3. **Recovery Time**: Monitor recovery time objectives
4. **Documentation**: Maintain backup and recovery procedures

### Application Backup

#### Code Repository

- **Git History**: Complete version control history
- **Tagging**: Tag releases for easy rollback
- **Branching**: Maintain separate branches for environments

#### Configuration Backup

- **Environment Variables**: Document and backup configurations
- **DNS Records**: Backup DNS configurations
- **SSL Certificates**: Backup SSL certificates (though Vercel manages this)

### Disaster Recovery Plan

#### Recovery Procedures

1. **Assess Impact**: Determine scope and impact of incident
2. **Communicate**: Notify stakeholders of the issue
3. **Initiate Recovery**: Begin recovery procedures
4. **Verify Systems**: Confirm systems are fully operational
5. **Post-Mortem**: Conduct incident review

#### Recovery Time Objectives (RTO)

- **Critical Systems**: 4 hours maximum recovery time
- **Non-Critical Systems**: 24 hours maximum recovery time
- **Data Recovery**: Point-in-time recovery within 1 hour

---

## Rollback Procedures

### Rollback Scenarios

#### 1. Application Issues

- **Critical Bugs**: Application functionality broken
- **Performance Issues**: Severe performance degradation
- **Security Issues**: Security vulnerabilities identified

#### 2. Infrastructure Issues

- **Database Issues**: Database connectivity or performance problems
- **Third-party Services**: External service failures
- **Network Issues**: Network connectivity problems

### Rollback Methods

#### Git-Based Rollback

```bash
# View recent commits
git log --oneline -10

# Rollback to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit (use with caution)
git reset --hard [commit-hash]
git push --force origin main
```

#### Vercel Rollback

1. **Go to Vercel Dashboard** → Deployments
2. **Find Previous Deployment**: Locate the last stable deployment
3. **Promote to Production**: Click "..." → "Promote to Production"
4. **Verify Rollback**: Test the rollback is successful

#### Database Rollback

```bash
# Using Supabase
supabase db rollback [migration-version]

# Restore from backup
supabase db restore [backup-file]
```

### Rollback Testing

#### Pre-Deployment Rollback Test

1. **Test Rollback**: Verify rollback procedures work
2. **Document Process**: Document rollback steps
3. **Team Training**: Train team on rollback procedures
4. **Regular Drills**: Conduct rollback drills quarterly

#### Rollback Verification Checklist

- [ ] **Application Loads**: Verify application loads correctly
- [ ] **Database Connectivity**: Confirm database connection
- [ ] **User Access**: Test user authentication
- [ ] **Core Features**: Verify critical functionality
- [ ] **Performance**: Confirm acceptable performance

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Build Failures

##### Issue: Build fails during deployment

**Symptoms**: Vercel build shows error status
**Causes**:

- Compilation errors
- Missing dependencies
- Environment variable issues

**Solutions**:

```bash
# Check local build
npm run build

# Check for missing dependencies
npm install

# Check environment variables
npm run build:check-env

# Clear build cache
rm -rf .next
npm run build
```

#### 2. Database Connection Issues

##### Issue: Cannot connect to Supabase

**Symptoms**: Database connection errors
**Causes**:

- Incorrect database URL
- Network connectivity issues
- Supabase service issues

**Solutions**:

```bash
# Test database connection
npx prisma db pull

# Check database URL
echo $DATABASE_URL

# Verify Supabase status
curl https://[project-ref].supabase.co/rest/v1/
```

#### 3. Environment Variable Issues

##### Issue: Environment variables not working

**Symptoms**: Configuration errors
**Causes**:

- Missing variables
- Incorrect variable names
- Permission issues

**Solutions**:

1. **Check Vercel Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Verify all required variables are present
   - Check variable names match code

2. **Debug Environment Variables**:

```javascript
// Debug environment variables
console.log("Environment Variables:", {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
});
```

#### 4. SSL Certificate Issues

##### Issue: SSL certificate problems

**Symptoms**: HTTPS errors, security warnings
**Causes**:

- DNS propagation issues
- Certificate verification problems
- Domain configuration errors

**Solutions**:

1. **Check DNS Propagation**:

```bash
nslookup yourdomain.com
dig yourdomain.com
```

2. **Verify SSL Certificate**:

```bash
openssl s_client -connect yourdomain.com:443
```

3. **Check Vercel SSL Status**:

- Go to Vercel Dashboard → Domains
- Verify SSL certificate status
- Re-issue certificate if needed

### Debugging Tools

#### Browser Developer Tools

1. **Console**: Check for JavaScript errors
2. **Network**: Monitor API requests and responses
3. **Application**: Review local storage and cookies
4. **Performance**: Analyze page load performance

#### Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link local project
vercel link

# View logs
vercel logs

# Deploy locally for testing
vercel dev
```

#### Supabase CLI

```bash
# Generate types
supabase gen types typescript --local > types/supabase.ts

# Database operations
supabase db diff
supabase db push
supabase db reset
```

### Support Resources

#### Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

#### Community Support

- **Vercel Discord**: https://chat.vercel.com/
- **Supabase Discord**: https://discord.supabase.com/
- **GitHub Issues**: Create issues for bug reports

#### Professional Support

- **Vercel Support**: Available for Pro and Enterprise plans
- **Supabase Support**: Available for paid plans
- **Emergency Contacts**: Maintain emergency contact list

---

## Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly Tasks

1. **Monitor Performance**: Check application performance metrics
2. **Review Logs**: Review error and access logs
3. **Security Updates**: Check for security updates
4. **Backup Verification**: Verify backup processes are working

#### Monthly Tasks

1. **Dependency Updates**: Update npm dependencies
2. **Database Maintenance**: Perform database optimization
3. **Security Audit**: Conduct security review
4. **Performance Review**: Analyze performance trends

#### Quarterly Tasks

1. **Major Updates**: Apply major version updates
2. **Security Assessment**: Comprehensive security review
3. **Disaster Recovery Test**: Test backup and recovery procedures
4. **Capacity Planning**: Review resource utilization

### Update Procedures

#### Application Updates

1. **Test Updates**: Test in staging environment first
2. **Schedule Maintenance**: Schedule maintenance windows
3. **Communicate Changes**: Notify users of upcoming changes
4. **Monitor Post-Deployment**: Monitor after deployment

#### Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Security audit
npm audit
npm audit fix
```

#### Database Updates

```bash
# Create new migration
npx prisma migrate dev --name update_description

# Apply migration to production
npx prisma migrate deploy

# Seed database if needed
npm run db:seed
```

### Scaling Procedures

#### Horizontal Scaling

- **Vercel Edge**: Automatic scaling through edge network
- **Database Scaling**: Monitor and upgrade database resources
- **CDN Optimization**: Optimize CDN configuration

#### Performance Optimization

- **Code Splitting**: Implement dynamic imports
- **Image Optimization**: Use Next.js Image component
- **Caching Strategy**: Implement effective caching
- **Bundle Optimization**: Optimize JavaScript bundles

### Communication Procedures

#### Maintenance Notifications

1. **Advance Notice**: Notify users 24-48 hours before maintenance
2. **Status Updates**: Provide regular status updates during maintenance
3. **Completion Notice**: Notify users when maintenance is complete
4. **Post-Mortem**: Share lessons learned after incidents

#### Incident Communication

1. **Immediate Notification**: Alert stakeholders of critical issues
2. **Regular Updates**: Provide regular status updates
3. **Resolution Notice**: Notify when issues are resolved
4. **Follow-up**: Share incident report and improvements

---

## Appendix

### Quick Reference Commands

#### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run linter
npm run type-check   # Type checking
```

#### Database Commands

```bash
npm run db:setup     # Initial database setup
npm run db:seed      # Seed database with initial data
npm run db:reset     # Reset and reseed database
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
```

#### Deployment Commands

```bash
vercel --prod        # Deploy to production
vercel --preview     # Deploy to preview
vercel logs          # View deployment logs
vercel ls            # List deployments
```

### Environment Variables Template

```env
# Required Variables
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="..."
NODE_ENV="production"

# Optional Variables
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="..."
EMAIL_FROM="Leave Management <noreply@yourdomain.com>"

# Analytics and Monitoring
VERCEL_ANALYTICS_ID="..."
SENTRY_DSN="..."
GOOGLE_ANALYTICS_ID="..."
```

### Contact Information

#### Technical Support

- **Primary**: tech-support@yourdomain.com
- **Emergency**: emergency@yourdomain.com
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support

#### Team Contacts

- **DevOps**: devops@yourdomain.com
- **Development**: dev-team@yourdomain.com
- **Project Manager**: pm@yourdomain.com

### Monitoring Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Application Monitoring**: https://analytics.yourdomain.com
- **Error Tracking**: https://sentry.io/your-project

---

## Version History

| Version | Date       | Changes                       | Author        |
| ------- | ---------- | ----------------------------- | ------------- |
| 1.0     | 2025-10-20 | Initial deployment runbook    | DevOps Team   |
| 1.1     | TBD        | Added troubleshooting section | Support Team  |
| 1.2     | TBD        | Updated security procedures   | Security Team |

---

**This deployment runbook provides comprehensive guidance for deploying and maintaining the Leave Management System in production. For technical support or questions, please refer to the contact information or reach out to the DevOps team.**

**Version**: 1.0
**Last Updated**: October 20, 2025
**Next Review**: January 2026
**Approved By**: DevOps Lead
