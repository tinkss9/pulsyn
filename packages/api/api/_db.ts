// Vercel serverless helper — PostgreSQL connection + authentication
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/pulsyn',
  max: 5,
  connectionTimeoutMillis: 5000,
});

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result;
}

// API Key authentication
export async function authenticate(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  // Check for API key in header
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'] as string;

  let apiKey: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  } else if (apiKeyHeader) {
    apiKey = apiKeyHeader;
  }

  // If no API key provided, check if this is a cron request with valid CRON_SECRET
  if (!apiKey) {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const cronAuth = req.headers.authorization;
      if (cronAuth === `Bearer ${cronSecret}` || req.headers['x-vercel-cron']) {
        return true; // Valid cron request
      }
    }

    res.status(401).json({
      error: 'Authentication required',
      message: 'Provide an API key via Authorization: Bearer <key> or X-Api-Key: <key>',
    });
    return false;
  }

  // Validate API key against database
  try {
    const result = await query(
      'SELECT id, name, organization_id FROM api_keys WHERE key = $1',
      [apiKey]
    );

    if (result.rowCount === 0) {
      res.status(401).json({ error: 'Invalid API key' });
      return false;
    }

    // Update last_used_at
    await query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE key = $1',
      [apiKey]
    );

    // Attach key info to request for downstream use
    (req as any).apiKeyInfo = result.rows[0];
    return true;
  } catch (err: any) {
    res.status(500).json({ error: 'Authentication failed', details: err.message });
    return false;
  }
}

// Generate a new API key
export function generateApiKey(): string {
  return `pk_${crypto.randomBytes(32).toString('hex')}`;
}

// Hash an API key for storage (optional - currently storing plaintext for simplicity)
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export { pool };
