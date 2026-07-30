// Pulsyn API Authentication Middleware
// Validates API keys from Authorization header

import { Request, Response, NextFunction } from 'express';
import { query } from '../db';

export interface AuthenticatedRequest extends Request {
  organizationId?: string;
  apiKeyId?: string;
  planId?: string;
}

/**
 * API key authentication middleware.
 * Extracts key from Authorization: Bearer <key> header,
 * validates against api_keys table, attaches organizationId to request.
 */
export async function authenticateApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Missing or invalid Authorization header. Expected: Bearer <api_key>',
    });
    return;
  }

  const apiKey = authHeader.slice(7).trim();

  if (!apiKey) {
    res.status(401).json({ error: 'Empty API key' });
    return;
  }

  try {
    // Look up the API key in the database
    const result = await query(
      `SELECT id, organization_id, plan_id, is_active, expires_at
       FROM api_keys
       WHERE key_hash = encode(digest($1, 'sha256'), 'hex')
       AND is_active = true`,
      [apiKey]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid or inactive API key' });
      return;
    }

    const keyRecord = result.rows[0];

    // Check expiration
    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      res.status(401).json({ error: 'API key has expired' });
      return;
    }

    // Update last_used_at
    await query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
      [keyRecord.id]
    );

    // Attach to request
    req.organizationId = keyRecord.organization_id;
    req.apiKeyId = keyRecord.id;
    req.planId = keyRecord.plan_id || 'community';

    next();
  } catch (err) {
    console.error('[Auth] Database error:', err);
    res.status(500).json({ error: 'Authentication service unavailable' });
  }
}

/**
 * Rate limiting middleware based on plan tier.
 * Returns 429 if limit exceeded.
 */
export async function rateLimitByPlan(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.organizationId) {
    next();
    return;
  }

  const planLimits: Record<string, number> = {
    community: 30,
    pro: 600,
    business: 6000,
    enterprise: 60000,
  };

  const limit = planLimits[req.planId || 'community'] || 30;
  const windowMs = 60000; // 1 minute

  try {
    const result = await query(
      `SELECT COUNT(*) as count
       FROM api_usage_log
       WHERE organization_id = $1
       AND created_at > NOW() - INTERVAL '1 minute'`,
      [req.organizationId]
    );

    const currentCount = parseInt(result.rows[0]?.count || '0');

    if (currentCount >= limit) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        limit,
        window: '1 minute',
        retryAfter: 60,
      });
      res.setHeader('Retry-After', '60');
      return;
    }

    // Log this request
    await query(
      `INSERT INTO api_usage_log (organization_id, endpoint, method)
       VALUES ($1, $2, $3)`,
      [req.organizationId, req.path, req.method]
    );

    next();
  } catch (err) {
    // Don't block on rate limit failures
    next();
  }
}
