import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { apiKey } = await req.json();

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }

  try {
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const result = await query(
      `SELECT ak.id, ak.organization_id, ak.plan_id, ak.is_active, ak.expires_at, o.name, o.email, o.company
       FROM api_keys ak JOIN organizations o ON o.id = ak.organization_id
       WHERE ak.key_hash = $1 AND ak.is_active = true`,
      [keyHash]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const record = result.rows[0];
    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ error: 'API key has expired' }, { status: 401 });
    }

    return NextResponse.json({
      data: { organizationId: record.organization_id, name: record.name, email: record.email, company: record.company, plan: record.plan_id },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
