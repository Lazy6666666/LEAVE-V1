#!/usr/bin/env node

/**
 * Security Vulnerability Scanner
 * Scans the codebase for common security vulnerabilities and misconfigurations
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class SecurityScanner {
  constructor() {
    this.vulnerabilities = [];
    this.warnings = [];
    this.info = [];
    this.baseDir = process.cwd();
    this.excludedDirs = [
      "node_modules",
      ".git",
      ".next",
      "dist",
      "build",
      "coverage",
      ".vercel",
      ".nyc_output",
    ];
    this.excludedFiles = ["*.log", "*.tmp", "*.cache"];
  }

  /**
   * Run the complete security scan
   */
  async run() {
    console.log("🔍 Starting Security Vulnerability Scanner...\n");

    await this.scanFiles();
    await this.checkDependencies();
    await this.checkEnvironmentVariables();
    await this.checkSecurityHeaders();
    await this.checkAuthentication();
    await this.checkDataValidation();
    await this.checkErrorHandling();
    await this.checkLogging();
    await this.checkPermissions();

    this.generateReport();
  }

  /**
   * Scan all source files for security issues
   */
  async scanFiles() {
    console.log("📁 Scanning source files...");

    const patterns = {
      // Hardcoded secrets
      secretPatterns: [
        /password\s*=\s*['"`]([^'"`]+)['"`]/gi,
        /api_key\s*=\s*['"`]([^'"`]+)['"`]/gi,
        /secret\s*=\s*['"`]([^'"`]+)['"`]/gi,
        /token\s*=\s*['"`]([^'"`]{10,})['"`]/gi,
        /private_key\s*=\s*['"`]([^'"`]+)['"`]/gi,
        /database_url\s*=\s*['"`]([^'"`]+)['"`]/gi,
      ],

      // SQL injection patterns
      sqlInjectionPatterns: [
        /query\s*\(\s*['"`][^'"`]*\$\{[^}]*\}[^'"`]*['"`]/gi,
        /execute\s*\(\s*['"`][^'"`]*\+[^'"`]*['"`]/gi,
        /sql\s*=\s*['"`][^'"`]*\+[^'"`]*['"`]/gi,
      ],

      // XSS patterns
      xssPatterns: [
        /dangerouslySetInnerHTML/gi,
        /innerHTML\s*=/gi,
        /outerHTML\s*=/gi,
        /document\.write/gi,
        /eval\s*\(/gi,
      ],

      // Insecure cryptographic patterns
      weakCryptoPatterns: [
        /md5\s*\(/gi,
        /sha1\s*\(/gi,
        /crypto\.createHash\(['"`]md1['"`]\)/gi,
        /crypto\.createHash\(['"`]sha1['"`]\)/gi,
      ],

      // Debug code
      debugPatterns: [
        /console\.log/gi,
        /console\.debug/gi,
        /debugger/gi,
        /debug\s*=\s*true/gi,
      ],
    };

    const files = this.getAllFiles(this.baseDir);

    for (const file of files) {
      if (!this.shouldScanFile(file)) continue;

      try {
        const content = fs.readFileSync(file, "utf8");

        // Check for hardcoded secrets
        for (const pattern of patterns.secretPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            this.addVulnerability(
              "Hardcoded Secret",
              file,
              `Potential hardcoded secret found: ${matches[0]}`,
              "HIGH"
            );
          }
        }

        // Check for SQL injection
        for (const pattern of patterns.sqlInjectionPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            this.addVulnerability(
              "SQL Injection",
              file,
              `Potential SQL injection vulnerability: ${matches[0]}`,
              "HIGH"
            );
          }
        }

        // Check for XSS
        for (const pattern of patterns.xssPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            this.addVulnerability(
              "XSS Vulnerability",
              file,
              `Potential XSS vulnerability: ${matches[0]}`,
              "HIGH"
            );
          }
        }

        // Check for weak cryptography
        for (const pattern of patterns.weakCryptoPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            this.addVulnerability(
              "Weak Cryptography",
              file,
              `Weak cryptographic algorithm found: ${matches[0]}`,
              "MEDIUM"
            );
          }
        }

        // Check for debug code
        for (const pattern of patterns.debugPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            this.addWarning(
              "Debug Code",
              file,
              `Debug code found in production: ${matches[0]}`
            );
          }
        }
      } catch (error) {
        console.warn(`Could not read file ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Check package.json for vulnerable dependencies
   */
  async checkDependencies() {
    console.log("📦 Checking dependencies...");

    const packageJsonPath = path.join(this.baseDir, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      this.addInfo("Dependencies", "package.json not found");
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Check for known vulnerable packages
      const vulnerablePackages = [
        { name: "lodash", version: "<4.17.21", severity: "HIGH" },
        { name: "request", version: "<2.88.0", severity: "HIGH" },
        { name: "node-forge", version: "<1.3.0", severity: "HIGH" },
        { name: "axios", version: "<0.21.1", severity: "MEDIUM" },
        { name: "jsonwebtoken", version: "<8.5.1", severity: "MEDIUM" },
      ];

      for (const dep of vulnerablePackages) {
        if (dependencies[dep.name]) {
          const installedVersion = dependencies[dep.name].replace(/[\^~]/g, "");
          if (this.compareVersions(installedVersion, dep.version) < 0) {
            this.addVulnerability(
              "Vulnerable Dependency",
              "package.json",
              `${dep.name}@${installedVersion} is vulnerable (${dep.severity} severity)`,
              dep.severity
            );
          }
        }
      }

      // Check for packages that might introduce security risks
      const riskyPackages = [
        "eval",
        "function",
        "vm2",
        "sandbox",
        "child_process",
      ];

      for (const risky of riskyPackages) {
        if (dependencies[risky]) {
          this.addWarning(
            "Risky Dependency",
            "package.json",
            `Package ${risky} may introduce security risks if not used carefully`
          );
        }
      }
    } catch (error) {
      console.warn("Could not parse package.json:", error.message);
    }
  }

  /**
   * Check for insecure environment variable configurations
   */
  async checkEnvironmentVariables() {
    console.log("🔧 Checking environment variables...");

    const envFiles = [".env", ".env.local", ".env.example"];

    for (const envFile of envFiles) {
      const envPath = path.join(this.baseDir, envFile);

      if (fs.existsSync(envPath)) {
        try {
          const content = fs.readFileSync(envPath, "utf8");
          const lines = content.split("\n");

          for (const line of lines) {
            const trimmedLine = line.trim();

            // Skip comments and empty lines
            if (trimmedLine.startsWith("#") || !trimmedLine.includes("="))
              continue;

            const [key, value] = trimmedLine.split("=");

            // Check for hardcoded secrets in env files
            if (value && !value.includes("${") && value.length > 10) {
              const secretKeys = [
                "SECRET",
                "KEY",
                "PASSWORD",
                "TOKEN",
                "PRIVATE",
              ];

              for (const secretKey of secretKeys) {
                if (
                  key.toUpperCase().includes(secretKey) &&
                  !value.includes("xxx") &&
                  !value.includes("placeholder")
                ) {
                  this.addVulnerability(
                    "Hardcoded Secret in .env",
                    envFile,
                    `Potential hardcoded secret: ${key}`,
                    "HIGH"
                  );
                }
              }
            }
          }

          // Check if .env is in .gitignore
          const gitignorePath = path.join(this.baseDir, ".gitignore");
          if (fs.existsSync(gitignorePath)) {
            const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");

            if (!gitignoreContent.includes(".env")) {
              this.addVulnerability(
                "Exposed .env File",
                ".gitignore",
                ".env files should be in .gitignore",
                "HIGH"
              );
            }
          }
        } catch (error) {
          console.warn(`Could not read ${envFile}:`, error.message);
        }
      }
    }
  }

  /**
   * Check security headers configuration
   */
  async checkSecurityHeaders() {
    console.log("🛡️ Checking security headers...");

    const middlewarePath = path.join(this.baseDir, "app", "middleware.ts");

    if (fs.existsSync(middlewarePath)) {
      try {
        const content = fs.readFileSync(middlewarePath, "utf8");

        const requiredHeaders = [
          "Content-Security-Policy",
          "X-Frame-Options",
          "X-Content-Type-Options",
          "Strict-Transport-Security",
          "X-DNS-Prefetch-Control",
        ];

        for (const header of requiredHeaders) {
          if (!content.includes(header)) {
            this.addWarning(
              "Missing Security Header",
              middlewarePath,
              `Security header ${header} not configured`
            );
          }
        }
      } catch (error) {
        console.warn(`Could not read middleware.ts:`, error.message);
      }
    } else {
      this.addWarning(
        "Missing Middleware",
        "app/middleware.ts",
        "Middleware file not found for security headers configuration"
      );
    }
  }

  /**
   * Check authentication and authorization
   */
  async checkAuthentication() {
    console.log("🔐 Checking authentication...");

    const authFiles = this.getAllFiles(this.baseDir).filter(
      (file) =>
        file.includes("auth") ||
        file.includes("login") ||
        file.includes("middleware")
    );

    let hasRateLimiting = false;
    let hasSessionManagement = false;
    let hasMFA = false;

    for (const file of authFiles) {
      try {
        const content = fs.readFileSync(file, "utf8");

        if (content.includes("rateLimit") || content.includes("RATE_LIMIT")) {
          hasRateLimiting = true;
        }

        if (content.includes("session") || content.includes("jwt")) {
          hasSessionManagement = true;
        }

        if (
          content.includes("mfa") ||
          content.includes("2fa") ||
          content.includes("totp")
        ) {
          hasMFA = true;
        }
      } catch (error) {
        console.warn(`Could not read ${file}:`, error.message);
      }
    }

    if (!hasRateLimiting) {
      this.addVulnerability(
        "Missing Rate Limiting",
        "Authentication",
        "Rate limiting not implemented for authentication endpoints",
        "MEDIUM"
      );
    }

    if (!hasSessionManagement) {
      this.addWarning(
        "Missing Session Management",
        "Authentication",
        "Session management implementation not found"
      );
    }

    if (!hasMFA) {
      this.addInfo("Multi-Factor Authentication", "MFA not implemented");
    }
  }

  /**
   * Check data validation and sanitization
   */
  async checkDataValidation() {
    console.log("✅ Checking data validation...");

    const apiFiles = this.getAllFiles(this.baseDir).filter(
      (file) => file.includes("api") && file.endsWith(".ts")
    );

    for (const file of apiFiles) {
      try {
        const content = fs.readFileSync(file, "utf8");

        // Check for input validation
        if (
          content.includes("req.body") ||
          content.includes("request.json()")
        ) {
          if (
            !content.includes("zod") &&
            !content.includes("joi") &&
            !content.includes("validation")
          ) {
            this.addVulnerability(
              "Missing Input Validation",
              file,
              "API endpoint missing input validation",
              "HIGH"
            );
          }
        }

        // Check for SQL injection prevention
        if (
          content.includes("SELECT") ||
          content.includes("INSERT") ||
          content.includes("UPDATE")
        ) {
          if (
            !content.includes("parameterized") &&
            !content.includes("prepared") &&
            !content.includes("prisma")
          ) {
            this.addWarning(
              "Potential SQL Injection",
              file,
              "Direct SQL queries without parameterization detected"
            );
          }
        }
      } catch (error) {
        console.warn(`Could not read ${file}:`, error.message);
      }
    }
  }

  /**
   * Check error handling
   */
  async checkErrorHandling() {
    console.log("⚠️ Checking error handling...");

    const files = this.getAllFiles(this.baseDir).filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js")
    );

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, "utf8");

        // Check for try-catch blocks in API routes
        if (file.includes("api")) {
          if (!content.includes("try") || !content.includes("catch")) {
            this.addWarning(
              "Missing Error Handling",
              file,
              "API route missing error handling"
            );
          }
        }

        // Check for information disclosure in errors
        if (
          content.includes("console.error") ||
          content.includes("console.log(error)")
        ) {
          this.addWarning(
            "Information Disclosure",
            file,
            "Error information may be exposed in logs"
          );
        }
      } catch (error) {
        console.warn(`Could not read ${file}:`, error.message);
      }
    }
  }

  /**
   * Check logging configuration
   */
  async checkLogging() {
    console.log("📝 Checking logging...");

    const files = this.getAllFiles(this.baseDir).filter(
      (file) => file.includes("log") || file.includes("audit")
    );

    if (files.length === 0) {
      this.addWarning(
        "Missing Logging",
        "Security",
        "No logging implementation found"
      );
      return;
    }

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, "utf8");

        // Check if sensitive data is being logged
        if (
          content.includes("password") ||
          content.includes("token") ||
          content.includes("secret")
        ) {
          this.addVulnerability(
            "Sensitive Data Logging",
            file,
            "Sensitive data may be logged",
            "MEDIUM"
          );
        }
      } catch (error) {
        console.warn(`Could not read ${file}:`, error.message);
      }
    }
  }

  /**
   * Check file permissions and access controls
   */
  async checkPermissions() {
    console.log("🔒 Checking permissions...");

    const sensitiveFiles = [
      "package.json",
      ".env",
      ".env.local",
      "prisma/schema.prisma",
      "next.config.js",
    ];

    for (const file of sensitiveFiles) {
      const filePath = path.join(this.baseDir, file);

      if (fs.existsSync(filePath)) {
        try {
          const stats = fs.statSync(filePath);
          const mode = stats.mode;

          // Check if file is readable by others (world-readable)
          if (mode & 0o004) {
            this.addVulnerability(
              "Insecure File Permissions",
              file,
              `File is world-readable (permissions: ${mode.toString(8)})`,
              "MEDIUM"
            );
          }
        } catch (error) {
          console.warn(
            `Could not check permissions for ${file}:`,
            error.message
          );
        }
      }
    }
  }

  /**
   * Get all files recursively from directory
   */
  getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !this.excludedDirs.includes(file)) {
        this.getAllFiles(filePath, fileList);
      } else if (stat.isFile() && this.shouldScanFile(filePath)) {
        fileList.push(filePath);
      }
    }

    return fileList;
  }

  /**
   * Check if file should be scanned
   */
  shouldScanFile(filePath) {
    const ext = path.extname(filePath);
    const scanExtensions = [".ts", ".js", ".jsx", ".tsx", ".json", ".env"];

    if (!scanExtensions.includes(ext)) return false;

    for (const excluded of this.excludedFiles) {
      if (filePath.includes(excluded)) return false;
    }

    return true;
  }

  /**
   * Compare version strings
   */
  compareVersions(a, b) {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }

    return 0;
  }

  /**
   * Add vulnerability to report
   */
  addVulnerability(type, file, description, severity = "MEDIUM") {
    this.vulnerabilities.push({
      type,
      file,
      description,
      severity,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Add warning to report
   */
  addWarning(type, file, description) {
    this.warnings.push({
      type,
      file,
      description,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Add info to report
   */
  addInfo(type, description) {
    this.info.push({
      type,
      description,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generate security report
   */
  generateReport() {
    console.log("\n📊 SECURITY SCAN REPORT\n");
    console.log("=".repeat(50));

    // Count issues
    const criticalVulns = this.vulnerabilities.filter(
      (v) => v.severity === "CRITICAL"
    ).length;
    const highVulns = this.vulnerabilities.filter(
      (v) => v.severity === "HIGH"
    ).length;
    const mediumVulns = this.vulnerabilities.filter(
      (v) => v.severity === "MEDIUM"
    ).length;
    const lowVulns = this.vulnerabilities.filter(
      (v) => v.severity === "LOW"
    ).length;

    console.log(`\n📈 SUMMARY:`);
    console.log(`   Critical Vulnerabilities: ${criticalVulns}`);
    console.log(`   High Vulnerabilities: ${highVulns}`);
    console.log(`   Medium Vulnerabilities: ${mediumVulns}`);
    console.log(`   Low Vulnerabilities: ${lowVulns}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    console.log(`   Info: ${this.info.length}`);

    // Display vulnerabilities
    if (this.vulnerabilities.length > 0) {
      console.log(`\n🚨 VULNERABILITIES (${this.vulnerabilities.length}):`);
      console.log("-".repeat(50));

      this.vulnerabilities.forEach((vuln, index) => {
        const severityIcon = this.getSeverityIcon(vuln.severity);
        console.log(
          `\n${index + 1}. ${severityIcon} ${vuln.type} [${vuln.severity}]`
        );
        console.log(`   File: ${vuln.file}`);
        console.log(`   Description: ${vuln.description}`);
      });
    }

    // Display warnings
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      console.log("-".repeat(50));

      this.warnings.forEach((warning, index) => {
        console.log(`\n${index + 1}. ${warning.type}`);
        console.log(`   File: ${warning.file}`);
        console.log(`   Description: ${warning.description}`);
      });
    }

    // Display info
    if (this.info.length > 0) {
      console.log(`\nℹ️  INFORMATION (${this.info.length}):`);
      console.log("-".repeat(50));

      this.info.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.type}`);
        console.log(`   Description: ${item.description}`);
      });
    }

    // Security score
    const totalIssues =
      criticalVulns * 10 + highVulns * 5 + mediumVulns * 2 + lowVulns * 1;
    const securityScore = Math.max(0, 100 - totalIssues);

    console.log(`\n🎯 SECURITY SCORE: ${securityScore}/100`);

    if (securityScore >= 90) {
      console.log("   ✅ Excellent security posture");
    } else if (securityScore >= 70) {
      console.log("   ⚠️  Good security posture with room for improvement");
    } else if (securityScore >= 50) {
      console.log("   🔶 Moderate security risks detected");
    } else {
      console.log("   🔴 High security risks - immediate attention required");
    }

    // Save report to file
    const reportData = {
      scanDate: new Date().toISOString(),
      summary: {
        critical: criticalVulns,
        high: highVulns,
        medium: mediumVulns,
        low: lowVulns,
        warnings: this.warnings.length,
        info: this.info.length,
        securityScore,
      },
      vulnerabilities: this.vulnerabilities,
      warnings: this.warnings,
      info: this.info,
    };

    const reportPath = path.join(this.baseDir, "security-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Exit with appropriate code
    if (criticalVulns > 0 || highVulns > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }

  /**
   * Get severity icon for display
   */
  getSeverityIcon(severity) {
    switch (severity) {
      case "CRITICAL":
        return "🔴";
      case "HIGH":
        return "🟠";
      case "MEDIUM":
        return "🟡";
      case "LOW":
        return "🟢";
      default:
        return "⚪";
    }
  }
}

// Run the scanner
if (require.main === module) {
  const scanner = new SecurityScanner();
  scanner.run().catch((error) => {
    console.error("Scanner failed:", error);
    process.exit(1);
  });
}

module.exports = SecurityScanner;
