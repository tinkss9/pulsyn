import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';
import {
  validateEmail,
  validateString,
  collectErrors,
  validationErrorsResponse,
} from '@/lib/validate';

// Rate limiting for signup attempts (per IP)
const signupAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_SIGNUPS_PER_HOUR = 5;

function checkSignupRateLimit(ip: string): boolean {
  const entry = signupAttempts.get(ip);
  if (!entry || entry.resetAt < Date.now()) {
    signupAttempts.set(ip, { count: 1, resetAt: Date.now() + 3600000 });
    return true;
  }
  if (entry.count >= MAX_SIGNUPS_PER_HOUR) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (!checkSignupRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many signups. Try again later.' }, { status: 429 });
  }

  const { email, name, company, website } = await req.json();

  // Honeypot check — if filled, it's a bot
  if (website) {
    // Silently reject but pretend success
    return NextResponse.json({
      data: { message: 'Verification code sent. Check your email.', emailVerificationRequired: true },
    });
  }

  const errors = collectErrors(
    validateEmail(email),
    validateString(name, 'name', { maxLength: 100 })
  );

  if (errors.length > 0) {
    return validationErrorsResponse(errors);
  }

  try {
    const existing = await query('SELECT id, verified FROM organizations WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      const org = existing.rows[0];
      if (org.verified) {
        return NextResponse.json({ error: 'Email already registered. Use login instead.' }, { status: 409 });
      }
      // Re-send verification code for unverified accounts
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await query(
        `UPDATE organizations SET verification_code = $1, code_expires_at = $2 WHERE email = $3`,
        [code, expiresAt, email.toLowerCase()]
      );
      console.log(`[Auth] Verification code for ${email}: ${code}`);
      return NextResponse.json({
        data: { message: 'Verification code sent. Check your email.', emailVerificationRequired: true },
      });
    }

    const orgId = `org-${crypto.randomUUID()}`;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await query(
      `INSERT INTO organizations (id, name, email, company, plan_id, verification_code, code_expires_at, verified, created_at)
       VALUES ($1, $2, $3, $4, 'community', $5, $6, false, NOW())`,
      [orgId, name, email.toLowerCase(), company || null, code, expiresAt]
    );

    console.log(`[Auth] Verification code for ${email}: ${code}`);

    return NextResponse.json({
      data: { message: 'Verification code sent. Check your email to complete signup.', emailVerificationRequired: true },
    });
  } catch (err) {
    console.error('[Auth] Signup error:', err);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
