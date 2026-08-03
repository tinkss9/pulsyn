import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
  }

  try {
    const codeHash = crypto.createHash('sha256').update(String(code)).digest('hex');

    const org = await query(
      `SELECT id, name, email, company, verification_code, verified FROM organizations WHERE email = $1`,
      [email]
    );

    if (org.rowCount === 0) {
      return NextResponse.json({ error: 'No account found for this email' }, { status: 404 });
    }

    const orgData = org.rows[0];

    if (orgData.verified) {
      return NextResponse.json({ error: 'Email already verified. Use login instead.' }, { status: 409 });
    }

    if (orgData.verification_code !== codeHash) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Mark as verified
    await query(
      `UPDATE organizations SET verified = true, verification_code = NULL, updated_at = NOW() WHERE id = $1`,
      [orgData.id]
    );

    // Generate API key
    const apiKey = `pulsyn_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyId = `key-${crypto.randomUUID()}`;

    await query(
      `INSERT INTO api_keys (id, organization_id, key_hash, name, plan_id, is_active, created_at) VALUES ($1, $2, $3, 'Default Key', 'community', true, NOW())`,
      [keyId, orgData.id, keyHash]
    );

    return NextResponse.json({
      data: {
        organizationId: orgData.id,
        apiKey,
        plan: 'community',
        message: 'Email verified! Save your API key — it cannot be retrieved later.',
      },
    }, { status: 201 });
  } catch (err) {
    console.error('[Auth] Verify error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
