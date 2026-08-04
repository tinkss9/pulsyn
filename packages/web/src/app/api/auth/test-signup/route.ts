import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

// Test-only endpoint: creates org + API key without email verification
// DISABLED in production — only works when E2E_TEST_SECRET is set AND NODE_ENV !== 'production'
export async function POST(req: NextRequest) {
  // Kill switch: completely disable in production
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_E2E_SIGNUP) {
    return NextResponse.json({ error: 'Test signup is disabled in production' }, { status: 403 });
  }

  const secret = req.headers.get('x-e2e-secret');
  const expectedSecret = process.env.E2E_TEST_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid test secret' }, { status: 403 });
  }

  try {
    const { email, name } = await req.json();
    const testEmail = email || `e2e-${Date.now()}@test.pulsyn.io`;
    const testName = name || 'E2E Test Org';

    // Create org (skip if exists)
    const existing = await query('SELECT id FROM organizations WHERE email = $1', [testEmail]);
    let orgId: string;

    if (existing.rows.length > 0) {
      orgId = existing.rows[0].id;
      // Mark as verified
      await query('UPDATE organizations SET verified = true WHERE id = $1', [orgId]);
    } else {
      orgId = `org-${crypto.randomUUID()}`;
      await query(
        `INSERT INTO organizations (id, name, email, plan_id, verified, created_at)
         VALUES ($1, $2, $3, 'community', true, NOW())`,
        [orgId, testName, testEmail]
      );
    }

    // Create API key
    const rawKey = `pulsyn_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyId = `key-${Date.now()}`;

    await query(
      `INSERT INTO api_keys (id, organization_id, key_hash, name, plan_id, is_active, created_at)
       VALUES ($1, $2, $3, 'E2E Test Key', 'community', true, NOW())`,
      [keyId, orgId, keyHash]
    );

    return NextResponse.json({
      data: { apiKey: rawKey, organizationId: orgId },
    });
  } catch (err) {
    console.error('[Auth] Test signup error:', err);
    return NextResponse.json({ error: 'Failed to create test account' }, { status: 500 });
  }
}
