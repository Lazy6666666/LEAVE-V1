# Security Playbook

## Table of Contents
1. [Incident Response](#incident-response)
2. [Security Monitoring](#security-monitoring)
3. [Threat Detection](#threat-detection)
4. [Containment Procedures](#containment-procedures)
5. [Recovery Procedures](#recovery-procedures)
6. [Post-Incident Analysis](#post-incident-analysis)

## Incident Response

### Incident Severity Levels

- **CRITICAL**: System compromise, data breach, service outage
- **HIGH**: Active attack, privilege escalation, multiple failed attempts
- **MEDIUM**: Suspicious activity, isolated security events
- **LOW**: Policy violations, minor security findings

### Response Team

- **Security Lead**: Coordinates response, makes final decisions
- **Technical Lead**: Implements technical containment and recovery
- **Communications Lead**: Manages internal and external communications
- **Business Lead**: Assesses business impact and decisions

### Immediate Response Steps

1. **Acknowledge Alert** (5 minutes)
   - Verify alert legitimacy
   - Assign incident coordinator
   - Initialize response team

2. **Assess Impact** (15 minutes)
   - Determine affected systems
   - Estimate data exposure risk
   - Assess service availability

3. **Initial Containment** (30 minutes)
   - Isolate affected systems
   - Block malicious IPs
   - Disable compromised accounts

## Security Monitoring

### Real-time Monitoring Dashboard

Access: `/admin/security-dashboard`

**Key Metrics:**
- Failed login attempts per minute
- Rate limit violations
- XSS/Injection attempts
- Blocked IP addresses
- Active security alerts

### Alert Thresholds

```javascript
const thresholds = {
  failedLoginsPerMinute: 5,
  failedLoginsPerHour: 20,
  rateLimitHitsPerMinute: 10,
  xssAttemptsPerHour: 3,
  suspiciousApiCallsPerMinute: 15,
  blockedIpsPerHour: 10,
};
```

### Automated Responses

1. **Rate Limiting**: Automatic IP blocking for 1 hour
2. **Failed Logins**: Progressive delays and account lockout
3. **XSS Attempts**: Immediate request blocking and alert
4. **Suspicious Patterns**: IP reputation checking and geolocation analysis

## Threat Detection

### Common Attack Vectors

#### 1. Brute Force Attacks
**Indicators:**
- Multiple failed login attempts from same IP
- Rapid password guessing patterns
- User enumeration attempts

**Detection:**
```sql
SELECT ip, COUNT(*) as attempts
FROM security_events
WHERE type = 'LOGIN_FAILED'
AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY ip
HAVING COUNT(*) > 20;
```

**Response:**
- Block IP for 24 hours
- Implement CAPTCHA
- Notify user account owners

#### 2. XSS Attacks
**Indicators:**
- Malicious script patterns in input
- HTML injection attempts
- JavaScript execution attempts

**Detection:**
```javascript
// XSS Pattern Detection
const xssPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^>]*>/gi,
];
```

**Response:**
- Sanitize input immediately
- Block malicious request
- Update XSS protection rules

#### 3. SQL Injection
**Indicators:**
- SQL keywords in user input
- Union-based injection attempts
- Boolean-based blind SQLi

**Detection:**
```javascript
const sqlPatterns = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|EXECUTE)\b)/i,
  /(--|\/\*|\*\/|;|\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
  /(\b(UNION|ALL|SELECT|DISTINCT|FROM|WHERE|JOIN)\b)/i,
];
```

**Response:**
- Block malicious requests
- Update WAF rules
- Review database logs

#### 4. CSRF Attacks
**Indicators:**
- Missing CSRF tokens
- Referer header mismatches
- State-changing requests without proper tokens

**Response:**
- Require CSRF tokens
- Validate referer headers
- Implement SameSite cookies

## Containment Procedures

### Network Level Containment

1. **IP Blocking**
```bash
# Block malicious IP
iptables -A INPUT -s 192.168.1.100 -j DROP

# Block IP range
iptables -A INPUT -s 192.168.1.0/24 -j DROP
```

2. **Application Level Blocking**
```javascript
// Block IP in application
await securityMonitoring.blockIP(maliciousIP, 3600); // 1 hour
```

3. **Cloudflare WAF Rules**
```javascript
// Create WAF rule
const wafRule = {
  expression: "(http.request.uri.path contains \"/admin\" and ip.geoip.country ne \"US\")",
  action: "block",
  description: "Block admin access from non-US countries"
};
```

### Database Level Containment

1. **Read-Only Mode**
```sql
-- Set database to read-only
ALTER DATABASE leavemanagement SET default_transaction_read_only = true;
```

2. **Connection Limiting**
```sql
-- Limit connections from suspicious IP
ALTER SYSTEM SET max_connections_per_ip = 1;
SELECT pg_reload_conf();
```

### Application Level Containment

1. **Feature Disabling**
```javascript
// Disable sensitive features
featureFlags.disable('file_uploads');
featureFlags.disable('user_registration');
```

2. **Session Invalidation**
```javascript
// Invalidate all sessions
await invalidateAllSessions();
// Invalidate sessions by IP
await invalidateSessionsByIP(maliciousIP);
```

## Recovery Procedures

### System Recovery

1. **Restore from Backup**
```bash
# Database recovery
pg_restore --clean --if-exists -d leavemanagement latest_backup.dump

# File system recovery
rsync -av /backup/files/ /var/www/files/
```

2. **Configuration Restoration**
```bash
# Restore environment variables
cp .env.backup .env
# Restart services
systemctl restart nginx
systemctl restart node
```

### User Account Recovery

1. **Password Reset**
```javascript
// Force password reset for affected users
await forcePasswordReset(affectedUserIds);
```

2. **Session Cleanup**
```javascript
// Clean up compromised sessions
await invalidateUserSessions(compromisedUserIds);
```

### Service Recovery

1. **Gradual Service Restoration**
   - Restore core functionality first
   - Enable non-critical features later
   - Monitor for recurring issues

2. **Performance Monitoring**
   - Monitor response times
   - Check error rates
   - Validate security controls

## Post-Incident Analysis

### Data Collection

1. **Timeline Creation**
   - Initial detection time
   - Response actions taken
   - Containment completion
   - Recovery completion

2. **Forensic Analysis**
   - System logs review
   - Network traffic analysis
   - Malware investigation

3. **Impact Assessment**
   - Data exposure analysis
   - Service impact assessment
   - Financial impact calculation

### Lessons Learned

1. **Root Cause Analysis**
   - Identify security gaps
   - Process failures
   - Technical vulnerabilities

2. **Improvement Planning**
   - Security control updates
   - Process improvements
   - Training requirements

3. **Documentation Updates**
   - Update security policies
   - Revise playbooks
   - Create new detection rules

### Reporting

### Internal Report Structure

1. **Executive Summary**
   - Incident overview
   - Business impact
   - Key takeaways

2. **Technical Details**
   - Attack methodology
   - Vulnerabilities exploited
   - Systems affected

3. **Response Actions**
   - Timeline of events
   - Containment measures
   - Recovery procedures

4. **Recommendations**
   - Short-term improvements
   - Long-term security strategy
   - Resource requirements

### External Communications

#### Customer Notification Template

```
Subject: Security Incident Notification

Dear Valued Customer,

We detected a security incident that may have affected your account.
Here's what we're doing about it:

[Description of incident]
[Steps we've taken]
[What you should do]

We take security seriously and are working to resolve this issue.
For more information, visit: [Status Page]

Best regards,
Security Team
```

#### Regulatory Notification

1. **GDPR** (72 hours for data breaches)
2. **CCPA** (reasonable time frame)
3. **Industry-specific** requirements

### Legal and Compliance

1. **Preserve Evidence**
   - Maintain chain of custody
   - Document all actions
   - Preserve logs and evidence

2. **Regulatory Reporting**
   - Follow breach notification laws
   - Report to authorities if required
   - Coordinate with legal counsel

3. **Insurance Claims**
   - Notify cybersecurity insurance
   - Document all costs
   - Follow claim procedures

## Emergency Contacts

### Internal Contacts
- **Security Lead**: [Contact Information]
- **Technical Lead**: [Contact Information]
- **Communications Lead**: [Contact Information]
- **Legal Counsel**: [Contact Information]

### External Contacts
- **Cybersecurity Insurance**: [Phone/Email]
- **Law Enforcement**: [Local Agency]
- **Forensics Firm**: [Retainer Information]
- **PR Agency**: [Crisis Communication]

## Training and Drills

### Regular Simulations

1. **Tabletop Exercises** (Quarterly)
   - Scenario-based discussions
   - Team coordination practice
   - Decision-making drills

2. **Live Drills** (Semi-annually)
   - Simulated attacks
   - Response time testing
   - Tool validation

3. **Red Team Exercises** (Annually)
   - Penetration testing
   - Social engineering simulations
   - Physical security tests

### Continuous Training

1. **Security Awareness** (Monthly)
   - Phishing simulations
   - Security reminders
   - Policy updates

2. **Technical Training** (Quarterly)
   - New threat techniques
   - Tool updates
   - Best practices

## Security Tools and Resources

### Monitoring Tools
- **SIEM System**: [Tool Name]
- **Log Management**: [Tool Name]
- **Threat Intelligence**: [Tool Name]
- **Vulnerability Scanner**: [Tool Name]

### Response Tools
- **SOAR Platform**: [Tool Name]
- **Forensic Tools**: [Tool Name]
- **Communication Tools**: [Tool Name]
- **Backup Systems**: [Tool Name]

### External Resources
- **CISA Alerts**: https://www.cisa.gov/
- **NIST Framework**: https://www.nist.gov/cyberframework
- **OWASP Resources**: https://owasp.org/
- **Industry ISAC**: [Contact Information]

## Appendix

### Checklists

#### Initial Response Checklist
- [ ] Alert acknowledged
- [ ] Incident coordinator assigned
- [ ] Response team notified
- [ ] Initial impact assessment completed
- [ ] Containment measures initiated

#### Containment Checklist
- [ ] Malicious IPs blocked
- [ ] Compromised accounts secured
- [ ] Sensitive systems isolated
- [ ] Evidence preservation initiated

#### Recovery Checklist
- [ ] Systems patched and secured
- [ ] Data integrity verified
- [ ] Services restored safely
- [ ] Monitoring intensified

#### Post-Incident Checklist
- [ ] Root cause identified
- [ ] Lessons learned documented
- [ ] Security controls updated
- [ ] Training conducted
- [ ] Reports completed and distributed

This playbook should be reviewed and updated regularly to reflect new threats and improved response procedures.