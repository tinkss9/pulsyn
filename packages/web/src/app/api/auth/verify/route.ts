import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
  }

  try {
    const result = await query(
      `SELECT id, verification_code, code_expires_at, verified FROM organizations WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No account found for this email. Please sign up first.' }, { status: 404 });
    }

    const org = result.rows[0];

    if (org.verified) {
      return NextResponse.json({ error: 'Email already verified. Please log in.' }, { status: 409 });
    }

    if (!org.verification_code || org.verification_code !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (org.code_expires_at && new Date(org.code_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired. Please sign up again.' }, { status: 400 });
    }

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
