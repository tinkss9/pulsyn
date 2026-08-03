import { NextResponse } from 'next/server';

export const KNOWN_ENGINES = ['postgresql', 'mysql', 'oracle', 'sqlserver', 'mongodb'] as const;
export type KnownEngine = (typeof KNOWN_ENGINES)[number];

export interface ValidationError {
  field: string;
  message: string;
}

export function validateString(
  value: unknown,
  field: string,
  opts: { required?: boolean; minLength?: number; maxLength?: number } = {}
): ValidationError | null {
  const { required = true, minLength = 1, maxLength } = opts;

  if (value === undefined || value === null || value === '') {
    if (required) return { field, message: `${field} is required` };
    return null;
  }

  if (typeof value !== 'string') {
    return { field, message: `${field} must be a string` };
  }

  if (value.length < minLength) {
    return { field, message: `${field} must be at least ${minLength} character(s)` };
  }

  if (maxLength && value.length > maxLength) {
    return { field, message: `${field} must be at most ${maxLength} characters` };
  }

  return null;
}

export function validateEmail(value: unknown): ValidationError | null {
  if (!value || typeof value !== 'string') {
    return { field: 'email', message: 'email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { field: 'email', message: 'invalid email format' };
  }

  return null;
}

export function validateEngine(value: unknown, field = 'engine'): ValidationError | null {
  if (!value || typeof value !== 'string') {
    return { field, message: `${field} is required` };
  }

  if (!KNOWN_ENGINES.includes(value as KnownEngine)) {
    return { field, message: `${field} must be one of: ${KNOWN_ENGINES.join(', ')}` };
  }

  return null;
}

export function validateRequiredObject(
  value: unknown,
  field: string,
  requiredKeys?: string[]
): ValidationError | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { field, message: `${field} must be an object` };
  }

  if (requiredKeys) {
    for (const key of requiredKeys) {
      if (!(key in (value as Record<string, unknown>))) {
        return { field: `${field}.${key}`, message: `${field} must have a ${key} field` };
      }
    }
  }

  return null;
}

export function validateArray(value: unknown, field: string): ValidationError | null {
  if (value !== undefined && value !== null && !Array.isArray(value)) {
    return { field, message: `${field} must be an array` };
  }
  return null;
}

export function collectErrors(...results: (ValidationError | null)[]): ValidationError[] {
  return results.filter((r): r is ValidationError => r !== null);
}

export function validationErrorsResponse(errors: ValidationError[]) {
  return NextResponse.json(
    { error: 'Validation failed', details: errors },
    { status: 400 }
  );
}
