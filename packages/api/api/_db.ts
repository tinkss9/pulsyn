// Vercel serverless helper — PostgreSQL connection + authentication + rate limiting
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

// Rate limit configuration
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute window
const DEFAULT_RATE_LIMIT = 100; // requests per minute

// API Key authentication with rate limiting
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
        return true; // Valid cron request — skip rate limiting
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

    const keyInfo = result.rows[0];

    // Check rate limit
    const rateLimitResult = await query(
      'SELECT * FROM check_rate_limit($1, $2, $3)',
      [keyInfo.id, req.url || 'unknown', RATE_LIMIT_WINDOW_SECONDS]
    );

    const { allowed, remaining, limit_val, reset_at } = rateLimitResult.rows[0];

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit_val.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(reset_at).toISOString());

    if (!allowed) {
      res.setHeader('Retry-After', RATE_LIMIT_WINDOW_SECONDS.toString());
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${limit_val} requests per minute.`,
        retryAfter: RATE_LIMIT_WINDOW_SECONDS,
        resetAt: new Date(reset_at).toISOString(),
      });
      return false;
    }

    // Update last_used_at
    await query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE key = $1',
      [apiKey]
    );

    // Attach key info to request for downstream use
    (req as any).apiKeyInfo = keyInfo;
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

// Hash an API key for storage (optional)
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export { pool };
