# Deployment Checklist

This guide will help you deploy the Leave Management System to production.

## Pre-Deployment Checklist

### 1. Security

- [ ] Change default admin password from `admin123`
- [ ] Review and update all environment variables
- [ ] Generate secure `NEXTAUTH_SECRET` if using NextAuth
- [ ] Enable HTTPS/SSL certificates
- [ ] Review and test all RLS policies
- [ ] Audit user permissions and roles
- [ ] Enable Supabase Auth email confirmation
- [ ] Configure password strength requirements
- [ ] Set up rate limiting for API endpoints
- [ ] Review CORS settings

### 2. Database

- [ ] Run all migrations on production database
- [ ] Execute RLS policies SQL script
- [ ] Verify all tables and indexes exist
- [ ] Test database connection from production
- [ ] Set up database backups (automated)
- [ ] Configure connection pooling settings
- [ ] Review and optimize slow queries

### 3. Environment Configuration

- [ ] Set `NODE_ENV=production`
- [ ] Configure production Supabase project
- [ ] Set up production database URLs
- [ ] Configure email service (SMTP)
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure analytics (optional)
- [ ] Set up monitoring and alerts

### 4. Application

- [ ] Run `npm run build` successfully
- [ ] Test all critical user flows
- [ ] Verify authentication works
- [ ] Test leave request/approval workflow
- [ ] Check responsive design on mobile
- [ ] Test email notifications
- [ ] Verify file uploads work
- [ ] Test all API endpoints

### 5. Performance

- [ ] Enable caching where appropriate
- [ ] Optimize images and assets
- [ ] Review and minimize bundle size
- [ ] Configure CDN for static assets
- [ ] Test application under load
- [ ] Set up database query optimization

## Deployment Steps

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial production deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   In Vercel Dashboard:
   - Go to Settings > Environment Variables
   - Add all variables from `.env.local`
   - Make sure to use production Supabase credentials

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your production URL

5. **Configure Custom Domain (Optional)**
   - Go to Settings > Domains
   - Add your custom domain
   - Configure DNS records as instructed

### Option 2: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app

   COPY package*.json ./
   RUN npm ci

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .

   RUN npx prisma generate
   RUN npm run build

   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app

   ENV NODE_ENV production

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"

   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t leave-management .
   docker run -p 3000:3000 --env-file .env.local leave-management
   ```

### Option 3: Traditional VPS (DigitalOcean, AWS, etc.)

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install nginx
   ```

2. **Clone and Build**
   ```bash
   git clone <your-repo-url>
   cd leave
   npm install
   npx prisma generate
   npm run build
   ```

3. **Configure PM2**
   ```bash
   pm2 start npm --name "leave-management" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   Create `/etc/nginx/sites-available/leave-management`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/leave-management /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Post-Deployment

### 1. Verify Deployment

- [ ] Visit production URL and verify it loads
- [ ] Test login with admin account
- [ ] Create a test leave request
- [ ] Verify emails are sent
- [ ] Check database connections
- [ ] Test all critical workflows
- [ ] Verify RLS policies are working
- [ ] Check error tracking dashboard

### 2. Monitoring Setup

**Recommended Tools:**
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, Rollbar
- **Performance**: Vercel Analytics, Google Analytics
- **Database**: Supabase Dashboard, pgAdmin

**Set up alerts for:**
- Application downtime
- High error rates
- Slow database queries
- Failed login attempts
- High CPU/memory usage

### 3. Backup Strategy

**Database Backups:**
- Enable Supabase automatic backups
- Set up daily backup schedule
- Test backup restoration process
- Store backups in multiple locations

**Code Backups:**
- Ensure Git repository is backed up
- Tag releases: `git tag v1.0.0`
- Keep production branch protected

### 4. User Onboarding

- [ ] Change default admin password
- [ ] Create initial user accounts
- [ ] Configure leave types for your company
- [ ] Set up company settings
- [ ] Upload company documents
- [ ] Train administrators
- [ ] Create user documentation

## Environment Variables for Production

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# Database (Production)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-prod-project.supabase.co:6543/postgres?pgbouncer=true
DIRECT_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-prod-project.supabase.co:5432/postgres

# Email (Production SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=noreply@yourcompany.com

# Error Tracking (Optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Rollback Plan

If issues occur after deployment:

1. **Immediate Rollback (Vercel)**
   - Go to Deployments tab
   - Click on previous working deployment
   - Click "Promote to Production"

2. **Database Rollback**
   ```bash
   # Rollback last migration
   npx prisma migrate resolve --rolled-back [migration-name]
   ```

3. **Git Rollback**
   ```bash
   git revert HEAD
   git push origin main
   ```

## Production Maintenance

### Daily
- Monitor error logs
- Check uptime status
- Review critical alerts

### Weekly
- Review performance metrics
- Check database query performance
- Audit user activity logs

### Monthly
- Test backup restoration
- Review security logs
- Update dependencies
- Review and optimize database

### Quarterly
- Security audit
- Performance review
- User feedback review
- Feature planning

## Support Contacts

- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support
- **Application Issues**: [Your support email]

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Production Best Practices](https://supabase.com/docs/guides/platform/going-into-prod)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
