import crypto from "crypto";

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  tag?: string;
  algorithm: string;
}

export interface DecryptionResult {
  decrypted: string;
  success: boolean;
  error?: string;
}

/**
 * Encryption utilities for sensitive data at rest
 * Uses AES-256-GCM for authenticated encryption
 */
export class EncryptionService {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits

  /**
   * Get or generate encryption key from environment
   */
  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
      throw new Error("ENCRYPTION_KEY environment variable is not set");
    }

    // Convert hex string to buffer, or derive from string
    let keyBuffer: Buffer;
    if (key.startsWith("hex:")) {
      keyBuffer = Buffer.from(key.slice(4), "hex");
    } else if (key.startsWith("base64:")) {
      keyBuffer = Buffer.from(key.slice(7), "base64");
    } else {
      // Derive key from string using PBKDF2
      const salt =
        process.env.ENCRYPTION_SALT || "default-salt-change-in-production";
      keyBuffer = crypto.pbkdf2Sync(
        key,
        salt,
        100000,
        this.KEY_LENGTH,
        "sha256"
      );
    }

    if (keyBuffer.length !== this.KEY_LENGTH) {
      throw new Error(`Encryption key must be ${this.KEY_LENGTH} bytes`);
    }

    return keyBuffer;
  }

  /**
   * Encrypt sensitive data
   */
  static encrypt(plaintext: string): EncryptionResult {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.IV_LENGTH);

      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      cipher.setAAD(Buffer.from("leave-management-system", "utf8"));

      let encrypted = cipher.update(plaintext, "utf8", "hex");
      encrypted += cipher.final("hex");

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
        algorithm: this.ALGORITHM,
      };
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: EncryptionResult): DecryptionResult {
    try {
      const key = this.getEncryptionKey();

      if (!encryptedData.tag) {
        throw new Error("Authentication tag is required for decryption");
      }

      const tag = Buffer.from(encryptedData.tag, "hex");

      const decipher = crypto.createDecipheriv(
        encryptedData.algorithm,
        key,
        encryptedData.iv
      ) as any;
      decipher.setAAD(Buffer.from("leave-management-system", "utf8"));
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return {
        decrypted,
        success: true,
      };
    } catch (error) {
      return {
        decrypted: "",
        success: false,
        error: `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Encrypt JSON object
   */
  static encryptObject(obj: Record<string, any>): EncryptionResult {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * Decrypt JSON object
   */
  static decryptObject<T = Record<string, any>>(
    encryptedData: EncryptionResult
  ): DecryptionResult & { data?: T } {
    const result = this.decrypt(encryptedData);

    if (!result.success) {
      return result;
    }

    try {
      const data = JSON.parse(result.decrypted);
      return {
        ...result,
        data,
      };
    } catch (error) {
      return {
        decrypted: "",
        success: false,
        error: `JSON parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Hash sensitive data (one-way, for passwords etc.)
   */
  static hash(data: string, salt?: string): { hash: string; salt: string } {
    const dataSalt = salt || crypto.randomBytes(32).toString("hex");
    const hash = crypto
      .pbkdf2Sync(data, dataSalt, 100000, 64, "sha512")
      .toString("hex");

    return {
      hash,
      salt: dataSalt,
    };
  }

  /**
   * Verify hash against data
   */
  static verifyHash(data: string, hash: string, salt: string): boolean {
    const computedHash = this.hash(data, salt);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash.hash, "hex"),
      Buffer.from(hash, "hex")
    );
  }

  /**
   * Generate secure random token
   */
  static generateToken(length = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Generate secure random string with specific characters
   */
  static generateRandomString(
    length = 16,
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  ): string {
    let result = "";
    const bytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }

    return result;
  }

  /**
   * Generate API key
   */
  static generateApiKey(prefix = "lm_"): string {
    const randomPart = this.generateRandomString(
      32,
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    );
    return `${prefix}${randomPart}`;
  }

  /**
   * Encrypt file content
   */
  static encryptFile(buffer: Buffer): EncryptionResult {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.IV_LENGTH);

      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

      const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

      const tag = cipher.getAuthTag();

      return {
        encrypted: encrypted.toString("base64"),
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
        algorithm: this.ALGORITHM,
      };
    } catch (error) {
      throw new Error(
        `File encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Decrypt file content
   */
  static decryptFile(
    encryptedData: EncryptionResult
  ): DecryptionResult & { buffer?: Buffer } {
    try {
      const key = this.getEncryptionKey();

      if (!encryptedData.tag) {
        throw new Error("Authentication tag is required for file decryption");
      }

      const tag = Buffer.from(encryptedData.tag, "hex");
      const encrypted = Buffer.from(encryptedData.encrypted, "base64");

      const decipher = crypto.createDecipheriv(
        encryptedData.algorithm,
        key,
        encryptedData.iv
      ) as any;
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return {
        decrypted: "File decrypted successfully",
        success: true,
        buffer: decrypted,
      };
    } catch (error) {
      return {
        decrypted: "",
        success: false,
        error: `File decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Validate encryption key
   */
  static validateEncryptionKey(): boolean {
    try {
      this.getEncryptionKey();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rotate encryption key (would need database migration in production)
   */
  static rotateKey(
    _oldEncryptedData: EncryptionResult[],
    _newKey: string
  ): EncryptionResult[] {
    // In a real implementation, this would:
    // 1. Decrypt all data with old key
    // 2. Re-encrypt with new key
    // 3. Update database records
    // This is a placeholder for the concept
    throw new Error("Key rotation requires database migration implementation");
  }
}

/**
 * Field-level encryption for database columns
 */
export class FieldEncryption {
  /**
   * Encrypt sensitive fields before database storage
   */
  static encryptFields(
    data: Record<string, any>,
    sensitiveFields: string[]
  ): Record<string, any> {
    const result = { ...data };

    for (const field of sensitiveFields) {
      if (result[field] && typeof result[field] === "string") {
        const encrypted = EncryptionService.encrypt(result[field]);
        result[field] = JSON.stringify(encrypted);
      }
    }

    return result;
  }

  /**
   * Decrypt sensitive fields after database retrieval
   */
  static decryptFields(
    data: Record<string, any>,
    sensitiveFields: string[]
  ): Record<string, any> {
    const result = { ...data };

    for (const field of sensitiveFields) {
      if (result[field] && typeof result[field] === "string") {
        try {
          const encryptedData = JSON.parse(result[field]);
          const decrypted = EncryptionService.decrypt(encryptedData);

          if (decrypted.success) {
            result[field] = decrypted.decrypted;
          } else {
            console.error(`Failed to decrypt field ${field}:`, decrypted.error);
            result[field] = "[ENCRYPTED]";
          }
        } catch (error) {
          console.error(`Failed to parse encrypted field ${field}:`, error);
          result[field] = "[ENCRYPTED]";
        }
      }
    }

    return result;
  }
}

// Default sensitive fields that should be encrypted
export const SENSITIVE_FIELDS = [
  "ssn",
  "social_security_number",
  "bank_account_number",
  "credit_card_number",
  "personal_email",
  "phone_number",
  "address",
  "emergency_contact",
  "medical_information",
  "salary",
  "compensation",
];

/**
 * Helper functions for common encryption tasks
 */
export const EncryptionHelpers = {
  /**
   * Encrypt user PII
   */
  encryptUserPII(userData: Record<string, any>): Record<string, any> {
    const piiFields = ["email", "phone", "address", "emergency_contact"];
    return FieldEncryption.encryptFields(userData, piiFields);
  },

  /**
   * Decrypt user PII
   */
  decryptUserPII(userData: Record<string, any>): Record<string, any> {
    const piiFields = ["email", "phone", "address", "emergency_contact"];
    return FieldEncryption.decryptFields(userData, piiFields);
  },

  /**
   * Encrypt audit log sensitive data
   */
  encryptAuditData(auditData: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      "ip_address",
      "user_agent",
      "old_values",
      "new_values",
    ];
    return FieldEncryption.encryptFields(auditData, sensitiveFields);
  },

  /**
   * Decrypt audit log sensitive data
   */
  decryptAuditData(auditData: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      "ip_address",
      "user_agent",
      "old_values",
      "new_values",
    ];
    return FieldEncryption.decryptFields(auditData, sensitiveFields);
  },
};
