import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

// In-memory rate limiting for verification attempts (per email)
const verificationAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email: string): { allowed: boolean; retryAfter?: number } {
  const entry = verificationAttempts.get(email);
  if (!entry) return { allowed: true };

  if (entry.lockedUntil > Date.now()) {
    return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - Date.now()) / 1000) };
  }

  // Lockout expired, reset
  if (entry.lockedUntil > 0 && entry.lockedUntil <= Date.now()) {
    verificationAttempts.delete(email);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordAttempt(email: string): void {
  const entry = verificationAttempts.get(email) || { count: 0, lockedUntil: 0 };
  entry.count++;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS;
  }

  verificationAttempts.set(email, entry);
}

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
  }

  // Rate limit check
  const rateLimit = checkRateLimit(email.toLowerCase());
  if (!rateLimit.allowed) {
    return NextResponse.json({
      error: `Too many attempts. Try again in ${rateLimit.retryAfter} seconds.`,
      code: 'RATE_LIMITED',
    }, { status: 429 });
  }

  try {
    const result = await query(
      `SELECT id, verification_code, code_expires_at, verified FROM organizations WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      recordAttempt(email.toLowerCase());
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    const org = result.rows[0];

    if (org.verified) {
      return NextResponse.json({ error: 'Email already verified. Please log in.' }, { status: 409 });
    }

    // Constant-time comparison
    const codeBuffer = Buffer.from(org.verification_code || '');
    const inputBuffer = Buffer.from(code);
    if (codeBuffer.length !== inputBuffer.length || !crypto.timingSafeEqual(codeBuffer, inputBuffer)) {
      recordAttempt(email.toLowerCase());
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (org.code_expires_at && new Date(org.code_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired. Please sign up again.' }, { status: 400 });
    }

    // Success — clear rate limit
    verificationAttempts.delete(email.toLowerCase());

    // Mark as verified and clear the code
    await query(
      `UPDATE organizations SET verified = true, verification_code = NULL, code_expires_at = NULL WHERE id = $1`,
      [org.id]
    );

    // Generate API key
    const apiKey = `pulsyn_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyId = `key-${crypto.randomUUID()}`;

    await query(
      `INSERT INTO api_keys (id, organization_id, key_hash, name, plan_id, is_active, created_at) VALUES ($1, $2, $3, 'Default Key', 'community', true, NOW())`,
      [keyId, org.id, keyHash]
    );

    return NextResponse.json({
      data: { organizationId: org.id, apiKey, plan: 'community', message: 'Email verified. Save your API key — it cannot be retrieved later.' },
    });
  } catch (err) {
    console.error('[Auth] Verification error:', err);
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
  }
}
