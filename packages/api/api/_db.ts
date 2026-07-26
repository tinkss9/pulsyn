// Vercel serverless helper — PostgreSQL connection + authentication + rate limiting + security logging + IP blocking
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
const RATE_LIMIT_WINDOW_SECONDS = 60;
const DEFAULT_RATE_LIMIT = 100;

// Extract IP address from request
function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

// Log security event
async function logSecurityEvent(
  eventType: string,
  apiKeyId: string | null,
  req: VercelRequest,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    await query(
      `SELECT log_security_event($1, $2, $3, $4, $5, $6, $7)`,
      [
        eventType,
        apiKeyId,
        getClientIp(req),
        req.headers['user-agent'] || 'unknown',
        req.url || 'unknown',
        req.method || 'unknown',
        JSON.stringify(details),
      ]
    );
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}

// Check if IP is blocked
async function isIpBlocked(ip: string): Promise<{ blocked: boolean; reason?: string; expiresAt?: string }> {
  try {
    const result = await query('SELECT * FROM is_ip_blocked($1)', [ip]);
    const row = result.rows[0];
    return {
      blocked: row.blocked,
      reason: row.reason,
      expiresAt: row.expires_at,
    };
  } catch {
    return { blocked: false };
  }
}

// Check and auto-block IP if threshold exceeded
async function checkAndAutoBlock(ip: string, req: VercelRequest): Promise<void> {
  try {
    const result = await query('SELECT * FROM check_and_auto_block($1)', [ip]);
    const row = result.rows[0];

    if (row.was_blocked) {
      await logSecurityEvent('suspicious_activity', null, req, {
        action: 'auto_blocked',
        reason: row.block_reason,
        ip,
      });
    }
  } catch (err) {
    console.error('Failed to check auto-block:', err);
  }
}

// API Key authentication with rate limiting, security logging, and IP blocking
export async function authenticate(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  const startTime = Date.now();
  const clientIp = getClientIp(req);

  // Check if IP is blocked FIRST (before any processing)
  const blockStatus = await isIpBlocked(clientIp);
  if (blockStatus.blocked) {
    res.status(403).json({
      error: 'IP blocked',
      message: 'Your IP has been blocked due to suspicious activity.',
      reason: blockStatus.reason,
      expiresAt: blockStatus.expiresAt,
      contact: 'support@pulsyn.io to request unblocking',
    });
    return false;
  }

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
        return true;
      }
    }

    // Log auth failure and check for auto-block
    await logSecurityEvent('auth_failure', null, req, {
      reason: 'no_api_key',
      hasAuthHeader: !!authHeader,
      hasApiKeyHeader: !!apiKeyHeader,
    });
    await checkAndAutoBlock(clientIp, req);

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
      // Log invalid key attempt and check for auto-block
      await logSecurityEvent('invalid_key', null, req, {
        reason: 'key_not_found',
        keyPrefix: apiKey.substring(0, 12) + '...',
      });
      await checkAndAutoBlock(clientIp, req);

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
      // Log rate limit violation
      await logSecurityEvent('rate_limit_exceeded', keyInfo.id, req, {
        limit: limit_val,
        remaining,
        windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
        resetAt: new Date(reset_at).toISOString(),
      });

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

    // Log successful auth
    await logSecurityEvent('auth_success', keyInfo.id, req, {
      keyName: keyInfo.name,
      durationMs: Date.now() - startTime,
    });

    // Attach key info to request for downstream use
    (req as any).apiKeyInfo = keyInfo;
    return true;
  } catch (err: any) {
    await logSecurityEvent('auth_failure', null, req, {
      reason: 'database_error',
      error: err.message,
    });

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
