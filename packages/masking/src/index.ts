// Pulsyn Masking Module
// In-flight data masking during replication

import * as crypto from 'crypto';

export interface MaskingRule {
  table: string;
  column: string;
  type: 'hash' | 'replace' | 'format-preserving' | 'redact';
  format?: string;
  salt?: string;
  replacement?: string;
}

export interface MaskingConfig {
  enabled: boolean;
  rules: MaskingRule[];
}

export class MaskingEngine {
  private rules: MaskingRule[];
  private salt: string;

  constructor(config: MaskingConfig) {
    this.rules = config.rules;
    this.salt = config.rules[0]?.salt || 'default-salt';
  }

  maskRow(table: string, row: Record<string, unknown>): Record<string, unknown> {
    const maskedRow = { ...row };

    for (const rule of this.rules) {
      if (rule.table === table && maskedRow[rule.column] !== undefined) {
        maskedRow[rule.column] = this.maskValue(
          maskedRow[rule.column],
          rule
        );
      }
    }

    return maskedRow;
  }

  private maskValue(value: unknown, rule: MaskingRule): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    const strValue = String(value);

    switch (rule.type) {
      case 'hash':
        return this.hashValue(strValue, rule.salt || this.salt);
      case 'replace':
        return rule.replacement || '***';
      case 'format-preserving':
        return this.formatPreserving(strValue, rule.format);
      case 'redact':
        return '[REDACTED]';
      default:
        return strValue;
    }
  }

  private hashValue(value: string, salt: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(salt + value);
    return hash.digest('hex');
  }

  private formatPreserving(value: string, format?: string): string {
    if (!format) {
      return value;
    }

    // Format-preserving masking
    // Example: SSN (XXX-XX-XXXX) -> (123-45-6789) -> (***-**-****)
    return format.replace(/[A-Z]/g, '*');
  }

  addRule(rule: MaskingRule): void {
    this.rules.push(rule);
  }

  removeRule(table: string, column: string): void {
    this.rules = this.rules.filter(
      (r) => !(r.table === table && r.column === column)
    );
  }

  getRules(): MaskingRule[] {
    return [...this.rules];
  }
}

// Common masking patterns
export const PATTERNS = {
  email: {
    type: 'hash' as const,
    format: '***@***.***',
  },
  phone: {
    type: 'format-preserving' as const,
    format: '(***) ***-****',
  },
  ssn: {
    type: 'format-preserving' as const,
    format: '***-**-****',
  },
  creditCard: {
    type: 'format-preserving' as const,
    format: '****-****-****-****',
  },
  name: {
    type: 'replace' as const,
    replacement: '***',
  },
  address: {
    type: 'replace' as const,
    replacement: '***',
  },
};
