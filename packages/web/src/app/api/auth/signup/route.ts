import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { email, name, company } = await req.json();

  if (!email || !name) {
    return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  try {
    const existing = await query('SELECT id FROM organizations WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered. Use login instead.' }, { status: 409 });
    }

    const orgId = `org-${crypto.randomUUID()}`;
    await query(
      `INSERT INTO organizations (id, name, email, company, plan_id, created_at) VALUES ($1, $2, $3, $4, 'community', NOW())`,
      [orgId, name, email, company || null]
    );

    const apiKey = `pulsyn_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyId = `key-${crypto.randomUUID()}`;

    await query(
      `INSERT INTO api_keys (id, organization_id, key_hash, name, plan_id, is_active, created_at) VALUES ($1, $2, $3, 'Default Key', 'community', true, NOW())`,
      [keyId, orgId, keyHash]
    );

    return NextResponse.json({
      data: { organizationId: orgId, apiKey, plan: 'community', message: 'Account created. Save your API key — it cannot be retrieved later.' },
    }, { status: 201 });
  } catch (err) {
    console.error('[Auth] Signup error:', err);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
