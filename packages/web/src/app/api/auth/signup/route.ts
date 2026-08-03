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

  if (name.length > 100) {
    return NextResponse.json({ error: 'Name must be 100 characters or less' }, { status: 400 });
  }

  try {
    const existing = await query('SELECT id, verified FROM organizations WHERE email = $1', [email]);
    if (existing.rows.length > 0 && existing.rows[0].verified) {
      return NextResponse.json({ error: 'Email already registered. Use login instead.' }, { status: 409 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    if (existing.rows.length > 0) {
      // Update existing unverified org
      await query(
        `UPDATE organizations SET name = $1, company = $2, verification_code = $3, updated_at = NOW() WHERE email = $4`,
        [name, company || null, codeHash, email]
      );
    } else {
      // Create new org (unverified)
      const orgId = `org-${crypto.randomUUID()}`;
      await query(
        `INSERT INTO organizations (id, name, email, company, plan_id, verified, verification_code, created_at) VALUES ($1, $2, $3, $4, 'community', false, $5, NOW())`,
        [orgId, name, email, company || null, codeHash]
      );
    }

    // Log verification code (in production, send email via Resend/SendGrid)
    console.log(`[AUTH] Verification code for ${email}: ${code}`);

    return NextResponse.json({
      data: {
        email,
        status: 'verification_required',
        message: `Verification code sent to ${email}. Check your inbox. (Dev mode: check server logs for code)`,
      },
    }, { status: 200 });
  } catch (err) {
    console.error('[Auth] Signup error:', err);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
