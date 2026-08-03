import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';
import {
  validateEmail,
  validateString,
  collectErrors,
  validationErrorsResponse,
} from '@/lib/validate';

export async function POST(req: NextRequest) {
  const { email, name, company } = await req.json();

  const errors = collectErrors(
    validateEmail(email),
    validateString(name, 'name', { maxLength: 100 })
  );

  if (errors.length > 0) {
    return validationErrorsResponse(errors);
  }

  try {
    const existing = await query('SELECT id, verified FROM organizations WHERE email = $1', [email]);
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
        [code, expiresAt, email]
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
      [orgId, name, email, company || null, code, expiresAt]
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
