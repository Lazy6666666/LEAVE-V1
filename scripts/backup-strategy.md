# Backup and Recovery Procedures

## Overview

This document outlines comprehensive backup and recovery procedures for the Leave Management System to ensure business continuity and data integrity.

## Backup Architecture

### Components to Backup

1. **Database**
   - PostgreSQL database (Supabase)
   - All tables: users, profiles, leaves, audit_logs, notifications, etc.
   - Database schema and constraints
   - Indexes and stored procedures

2. **Application Data**
   - Uploaded documents and files
   - Configuration files
   - Environment variables (secure storage)
   - SSL certificates

3. **Code and Infrastructure**
   - Application source code (Git repository)
   - Configuration files
   - Infrastructure as Code (IaC) definitions
   - Deployment scripts

## Backup Schedule

### Automated Backups

#### Database Backups

- **Full Daily Backup**: Every day at 2:00 AM UTC
- **Incremental Hourly Backup**: Every hour at :15 minutes
- **Transaction Log Backup**: Every 15 minutes
- **Weekly Full Backup**: Every Sunday at 1:00 AM UTC (retained for 4 weeks)
- **Monthly Archive**: First day of month (retained for 12 months)

#### File Storage Backups

- **Documents**: Daily backup at 3:00 AM UTC
- **Configuration**: Change-triggered backup
- **Logs**: Daily backup with 30-day retention

#### Code Repository

- **Git Mirrors**: Automatic push to backup repository
- **Release Tags**: Automatic backup for each release
- **Branches**: Weekly backup of all branches

### Retention Policy

| Backup Type      | Retention Period | Storage Location    |
| ---------------- | ---------------- | ------------------- |
| Daily Backups    | 30 days          | Primary & Secondary |
| Weekly Backups   | 12 weeks         | Primary & Secondary |
| Monthly Backups  | 12 months        | Primary & Secondary |
| Annual Archives  | 7 years          | Cold Storage        |
| Transaction Logs | 7 days           | Hot Storage         |
| Code Repository  | Forever          | Multiple Locations  |

## Backup Storage

### Primary Storage

- **Location**: Primary cloud storage (Same region as application)
- **Encryption**: AES-256 encryption at rest and in transit
- **Access**: Role-based access with MFA required
- **Monitoring**: Daily integrity checks

### Secondary Storage

- **Location**: Different geographic region (Cross-region replication)
- **Encryption**: Same encryption standards as primary
- **Access**: Limited to disaster recovery scenarios
- **Sync**: Real-time replication for critical data

### Cold Storage

- **Location**: Long-term archival storage
- **Cost-Optimized**: Reduced redundancy for long-term storage
- **Retrieval**: Standard retrieval times (3-5 hours)
- **Purpose**: Compliance and historical records

## Backup Scripts

### Database Backup Script

```bash
#!/bin/bash
# database-backup.sh

# Configuration
DB_HOST="${DB_HOST}"
DB_PORT="${DB_PORT}"
DB_NAME="${DB_NAME}"
DB_USER="${DB_USER}"
BACKUP_DIR="/backups/database"
S3_BUCKET="s3://backup-bucket/database"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create database backup
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --format=custom \
  --compress=9 \
  --verbose \
  --file="$BACKUP_DIR/backup_$DATE.dump"

# Create schema backup
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --schema-only \
  --file="$BACKUP_DIR/schema_$DATE.sql"

# Encrypt backup
gpg --cipher-algo AES256 --compress-algo 1 --symmetric \
  --output "$BACKUP_DIR/backup_$DATE.dump.gpg" \
  "$BACKUP_DIR/backup_$DATE.dump"

# Upload to S3
aws s3 cp "$BACKUP_DIR/backup_$DATE.dump.gpg" "$S3_BUCKET/"
aws s3 cp "$BACKUP_DIR/schema_$DATE.sql" "$S3_BUCKET/"

# Clean local files (keep last 7 days)
find "$BACKUP_DIR" -name "*.dump" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.gpg" -mtime +7 -delete

# Verify backup
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $DATE"
  # Send notification
  curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="✅ Database backup completed successfully: $DATE"
else
  echo "Backup failed: $DATE"
  # Send alert
  curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="🚨 Database backup FAILED: $DATE"
fi
```

### File Backup Script

```bash
#!/bin/bash
# file-backup.sh

# Configuration
SOURCE_DIR="/app/storage"
BACKUP_DIR="/backups/files"
S3_BUCKET="s3://backup-bucket/files"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create incremental backup
rsync -av --delete \
  --link-dest="$BACKUP_DIR/latest" \
  "$SOURCE_DIR/" "$BACKUP_DIR/$DATE/"

# Update latest symlink
rm -f "$BACKUP_DIR/latest"
ln -s "$BACKUP_DIR/$DATE" "$BACKUP_DIR/latest"

# Create compressed archive
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"

# Upload to S3
aws s3 cp "$BACKUP_DIR/files_$DATE.tar.gz" "$S3_BUCKET/"

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" -mtime +30 -exec rm -rf {} \;

echo "File backup completed: $DATE"
```

## Recovery Procedures

### Disaster Recovery Levels

#### Level 1: Data Recovery (Minor Incident)

- **Scope**: Single database/table recovery
- **RTO**: 1-2 hours
- **RPO**: 15 minutes
- **Process**: Restore from latest incremental backup

#### Level 2: Application Recovery (Major Incident)

- **Scope**: Full application restoration
- **RTO**: 4-6 hours
- **RPO**: 1 hour
- **Process**: Restore from latest full backup

#### Level 3: Site Recovery (Disaster)

- **Scope**: Complete infrastructure restoration
- **RTO**: 24-48 hours
- **RPO**: 24 hours
- **Process**: Activate disaster recovery site

### Recovery Scripts

#### Database Recovery

```bash
#!/bin/bash
# database-recovery.sh

# Configuration
DB_HOST="${DB_HOST}"
DB_PORT="${DB_PORT}"
DB_NAME="${DB_NAME}"
DB_USER="${DB_USER}"
BACKUP_FILE=$1
S3_BUCKET="s3://backup-bucket/database"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  echo "Available backups:"
  aws s3 ls "$S3_BUCKET/" | grep ".dump.gpg"
  exit 1
fi

# Download backup from S3
aws s3 cp "$S3_BUCKET/$BACKUP_FILE" "/tmp/backup.gpg"

# Decrypt backup
gpg --decrypt --output "/tmp/backup.dump" "/tmp/backup.gpg"

# Restore database
pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --verbose --clean --if-exists "/tmp/backup.dump"

# Verify restoration
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -c "SELECT COUNT(*) FROM users;"

# Clean up
rm -f /tmp/backup.gpg /tmp/backup.dump

echo "Database recovery completed from: $BACKUP_FILE"
```

#### File Recovery

```bash
#!/bin/bash
# file-recovery.sh

# Configuration
SOURCE_DIR="/app/storage"
BACKUP_FILE=$1
S3_BUCKET="s3://backup-bucket/files"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.tar.gz>"
  echo "Available backups:"
  aws s3 ls "$S3_BUCKET/" | grep ".tar.gz"
  exit 1
fi

# Download backup from S3
aws s3 cp "$S3_BUCKET/$BACKUP_FILE" "/tmp/files.tar.gz"

# Extract backup
tar -xzf "/tmp/files.tar.gz" -C "/tmp/"

# Restore files
rsync -av --delete "/tmp/$(basename "$BACKUP_FILE" .tar.gz)/" "$SOURCE_DIR/"

# Set proper permissions
chown -R app:app "$SOURCE_DIR"
chmod -R 755 "$SOURCE_DIR"

# Clean up
rm -rf /tmp/files.tar.gz "/tmp/$(basename "$BACKUP_FILE" .tar.gz)"

echo "File recovery completed from: $BACKUP_FILE"
```

## Testing and Validation

### Backup Verification

- **Daily**: Automated backup integrity checks
- **Weekly**: Test restore to staging environment
- **Monthly**: Full disaster recovery drill
- **Quarterly**: Third-party security audit

### Test Scenarios

1. **Database Corruption**
   - Simulate database corruption
   - Test point-in-time recovery
   - Validate data integrity

2. **File System Failure**
   - Simulate file system corruption
   - Test file restoration
   - Verify file integrity

3. **Complete Site Failure**
   - Activate disaster recovery site
   - Test full application functionality
   - Validate data synchronization

## Monitoring and Alerting

### Backup Monitoring Metrics

- Backup success/failure rate
- Backup completion time
- Storage utilization
- Backup file integrity

### Alert Configuration

- **Critical**: Backup failure, storage full
- **Warning**: Backup completion delay, storage >80%
- **Info**: Backup completion success

### Notification Channels

- Email alerts to IT team
- Slack notifications
- SMS for critical alerts
- Dashboard monitoring

## Security Considerations

### Backup Encryption

- AES-256 encryption for all backups
- Separate encryption keys stored securely
- Key rotation every 90 days
- Access logging and audit trails

### Access Control

- Role-based access to backup systems
- MFA required for backup operations
- Regular access reviews
- Separation of duties

### Compliance Requirements

- GDPR compliance for EU data
- Data retention policies
- Audit trail for all backup operations
- Privacy impact assessments

## Documentation and Training

### Documentation

- Runbooks for all recovery procedures
- Contact information for all stakeholders
- System architecture diagrams
- Network configuration details

### Training

- Monthly disaster recovery drills
- Quarterly training for IT staff
- Annual full-scale disaster recovery test
- Documentation updates after each incident

## Continuous Improvement

### Metrics and KPIs

- RTO/RPO compliance
- Backup success rate (target: 99.9%)
- Recovery time tracking
- Incident post-mortems

### Process Reviews

- Quarterly backup strategy review
- Annual disaster recovery plan update
- Regular risk assessments
- Technology evaluation and updates

## Emergency Contacts

### Primary Contacts

- **IT Director**: [Name] - [Phone] - [Email]
- **Database Administrator**: [Name] - [Phone] - [Email]
- **System Administrator**: [Name] - [Phone] - [Email]
- **Application Lead**: [Name] - [Phone] - [Email]

### Secondary Contacts

- **CIO**: [Name] - [Phone] - [Email]
- **Security Officer**: [Name] - [Phone] - [Email]
- **External Vendor**: [Company] - [Phone] - [Email]

## Appendix

### Backup Tools and Technologies

- **Database**: PostgreSQL, pg_dump, pg_restore
- **Storage**: AWS S3, Glacier
- **Encryption**: GPG, AWS KMS
- **Monitoring**: CloudWatch, custom scripts
- **Automation**: Cron, AWS Lambda

### Checklist Templates

#### Daily Backup Checklist

- [ ] Database backup completed
- [ ] File backup completed
- [ ] Backup integrity verified
- [ ] Monitoring alerts checked
- [ ] Storage utilization reviewed

#### Monthly Review Checklist

- [ ] Backup success rate reviewed
- [ ] Recovery procedures tested
- [ ] Access permissions reviewed
- [ ] Documentation updated
- [ ] Training conducted

#### Quarterly DR Test Checklist

- [ ] DR test plan prepared
- [ ] Stakeholders notified
- [ ] Test environment prepared
- [ ] Recovery procedures executed
- [ ] Test results documented
- [ ] Lessons learned captured
- [ ] Procedures updated if needed
