/**
 * Input Sanitization and XSS Protection Utilities
 *
 * Provides comprehensive input sanitization to prevent XSS attacks
 * and ensure data integrity across the application.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization configuration for different content types
 */
const SANITIZATION_CONFIGS = {
  // Strict: No HTML allowed, plain text only
  strict: {
    ALLOWED_TAGS: [] as string[],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true,
  },
  // Basic: Basic formatting allowed
  basic: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span'] as string[],
    ALLOWED_ATTR: ['class'] as string[],
    KEEP_CONTENT: true,
  },
  // Rich: Rich text formatting allowed
  rich: {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'span', 'strong', 'em', 'i', 'b',
      'u', 'ul', 'ol', 'li', 'blockquote',
      'a', 'code', 'pre'
    ] as string[],
    ALLOWED_ATTR: ['href', 'title', 'class', 'target'] as string[],
    KEEP_CONTENT: true,
  },
} as const;

type SanitizationLevel = keyof typeof SANITIZATION_CONFIGS;

/**
 * XSS Protection Class
 */
export class XSSProtection {

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHTML(
    html: string,
    level: SanitizationLevel = 'strict'
  ): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    const config = SANITIZATION_CONFIGS[level];

    // Configure DOMPurify
    const configResult = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: config.ALLOWED_TAGS,
      ALLOWED_ATTR: config.ALLOWED_ATTR,
      KEEP_CONTENT: config.KEEP_CONTENT,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      SANITIZE_DOM: true,
      SANITIZE_NAMED_PROPS: true,
      WHOLE_DOCUMENT: false,
      CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: null,
        attributeNameCheck: null,
        allowCustomizedBuiltInElements: false,
      },
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    });

    return configResult;
  }

  /**
   * Sanitize plain text input
   */
  static sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Remove HTML tags
    let sanitized = text.replace(/<[^>]*>/g, '');

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>]/g, '');

    // Normalize whitespace
    sanitized = sanitized.trim().replace(/\s+/g, ' ');

    // Length limit to prevent DoS
    const MAX_LENGTH = 10000;
    if (sanitized.length > MAX_LENGTH) {
      sanitized = sanitized.substring(0, MAX_LENGTH);
    }

    return sanitized;
  }

  /**
   * Sanitize email address
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }

    // Basic email sanitization
    const sanitized = email.toLowerCase().trim();

    // Remove potentially dangerous characters
    const cleanEmail = sanitized.replace(/[<>]/g, '');

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(cleanEmail) ? cleanEmail : '';
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(value: string | number): number | null {
    if (typeof value === 'number') {
      return isNaN(value) ? null : value;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const sanitized = value.trim();
    const parsed = parseFloat(sanitized);

    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Sanitize UUID
   */
  static sanitizeUUID(uuid: string): string {
    if (!uuid || typeof uuid !== 'string') {
      return '';
    }

    const sanitized = uuid.trim().replace(/[^a-f0-9-]/gi, '');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidRegex.test(sanitized) ? sanitized : '';
  }

  /**
   * Sanitize file name
   */
  static sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      return '';
    }

    // Remove path traversal attempts
    let sanitized = filename.replace(/[\/\\]/g, '_');

    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>:"|?*]/g, '_');

    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, '');

    // Remove leading/trailing dots and spaces
    sanitized = sanitized.trim().replace(/^\.+|\.+$/g, '');

    // Limit length
    const maxLength = 255;
    if (sanitized.length > maxLength) {
      const extension = sanitized.includes('.') ?
        sanitized.substring(sanitized.lastIndexOf('.')) : '';
      const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.')) || sanitized;
      const maxNameLength = maxLength - extension.length;
      sanitized = nameWithoutExt.substring(0, maxNameLength) + extension;
    }

    return sanitized || 'unnamed_file';
  }

  /**
   * Sanitize URL
   */
  static sanitizeURL(url: string): string {
    if (!url || typeof url !== 'string') {
      return '';
    }

    const sanitized = url.trim();

    // Allow only http, https, mailto protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    let protocol: string;

    try {
      const parsed = new URL(sanitized);
      protocol = parsed.protocol;
    } catch {
      // Invalid URL
      return '';
    }

    if (!allowedProtocols.includes(protocol)) {
      return '';
    }

    return sanitized;
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJSON(jsonString: string): any {
    if (!jsonString || typeof jsonString !== 'string') {
      return null;
    }

    try {
      const parsed = JSON.parse(jsonString);

      // Remove prototype pollution attempts
      const cleanData = this.removePrototypePollution(parsed);

      return cleanData;
    } catch {
      return null;
    }
  }

  /**
   * Remove prototype pollution from objects
   */
  private static removePrototypePollution(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.removePrototypePollution(item));
    }

    const cleanObj: any = {};
    for (const key in obj) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      cleanObj[key] = this.removePrototypePollution(obj[key]);
    }

    return cleanObj;
  }
}

/**
 * Input Validation Class
 */
export class InputValidator {
  /**
   * Validate and sanitize request body
   */
  static sanitizeRequestBody(body: any, schema: any): any {
    if (!body || typeof body !== 'object') {
      return null;
    }

    try {
      // First, let the schema validation handle structure
      const validated = schema.parse(body);

      // Then sanitize each field
      return this.sanitizeObject(validated);
    } catch (error) {
      console.error('Schema validation failed:', error);
      return null;
    }
  }

  /**
   * Recursively sanitize object properties
   */
  private static sanitizeObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = this.sanitizeValue(value);
    }

    return sanitized;
  }

  /**
   * Sanitize individual values
   */
  private static sanitizeValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return XSSProtection.sanitizeText(value);
    }

    if (typeof value === 'number') {
      return XSSProtection.sanitizeNumber(value);
    }

    if (typeof value === 'object') {
      return this.sanitizeObject(value);
    }

    return value;
  }
}

/**
 * Content Security Policy (CSP) Helper
 */
export class CSPHelper {
  /**
   * Generate nonce for inline scripts
   */
  static generateNonce(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
  }

  /**
   * Validate nonce
   */
  static validateNonce(nonce: string, storedNonce: string): boolean {
    return Boolean(nonce && storedNonce && nonce === storedNonce);
  }
}

/**
 * HTTP Security Headers Helper
 */
export class SecurityHeaders {
  /**
   * Generate security headers for responses
   */
  static getSecurityHeaders(isProduction: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
    };

    if (isProduction) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    return headers;
  }
}