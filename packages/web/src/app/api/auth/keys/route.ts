import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

// POST /api/auth/keys — create a new API key
export async function POST(req: NextRequest) {
  const { organizationId, name } = await req.json();
  if (!organizationId) {
    return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
  }

  try {
    const apiKey = `pulsyn_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyId = `key-${crypto.randomUUID()}`;

    await query(
      `INSERT INTO api_keys (id, organization_id, key_hash, name, is_active, created_at) VALUES ($1, $2, $3, $4, true, NOW())`,
      [keyId, organizationId, keyHash, name || 'API Key']
    );

    return NextResponse.json({
      data: { keyId, apiKey, name: name || 'API Key', message: 'Save your API key — it cannot be retrieved later.' },
    }, { status: 201 });
  } catch (err) {
    console.error('[Auth] Key generation error:', err);
    return NextResponse.json({ error: 'Failed to generate API key' }, { status: 500 });
  }
}
