// Serverless-compatible rate limiter using Supabase
// Works across Vercel serverless function instances

import { query } from '@/lib/db';

const RATE_LIMIT = 30; // requests per window
const WINDOW_SECONDS = 60; // 1 minute window

/** Simple hash for API key (not cryptographically secure, just for storage) */
function hashKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return `rl-${Math.abs(hash).toString(36)}`;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
}

/**
 * Check and increment rate limit for an API key.
 * Uses Supabase for persistence across serverless instances.
 */
export async function checkRateLimit(apiKey: string): Promise<RateLimitResult> {
  const keyHash = hashKey(apiKey);
  const now = new Date();

  try {
    // Try to get existing record
    const existing = await query(
      `SELECT request_count, window_start FROM ai_rate_limits WHERE api_key_hash = $1`,
      [keyHash]
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      const windowStart = new Date(row.window_start);
      const elapsed = (now.getTime() - windowStart.getTime()) / 1000;

      if (elapsed < WINDOW_SECONDS) {
        // Within current window
        const count = parseInt(row.request_count);
        if (count >= RATE_LIMIT) {
          const resetAt = new Date(windowStart.getTime() + WINDOW_SECONDS * 1000).toISOString();
          return { allowed: false, remaining: 0, resetAt };
        }
        // Increment
        await query(
          `UPDATE ai_rate_limits SET request_count = request_count + 1, updated_at = NOW() WHERE api_key_hash = $1`,
          [keyHash]
        );
        const resetAt = new Date(windowStart.getTime() + WINDOW_SECONDS * 1000).toISOString();
        return { allowed: true, remaining: RATE_LIMIT - count - 1, resetAt };
      } else {
        // Window expired — reset
        await query(
          `UPDATE ai_rate_limits SET request_count = 1, window_start = NOW(), updated_at = NOW() WHERE api_key_hash = $1`,
          [keyHash]
        );
        return { allowed: true, remaining: RATE_LIMIT - 1, resetAt: new Date(now.getTime() + WINDOW_SECONDS * 1000).toISOString() };
      }
    } else {
      // New key — insert
      await query(
        `INSERT INTO ai_rate_limits (api_key_hash, request_count, window_start, updated_at) VALUES ($1, 1, NOW(), NOW())`,
        [keyHash]
      );
      return { allowed: true, remaining: RATE_LIMIT - 1, resetAt: new Date(now.getTime() + WINDOW_SECONDS * 1000).toISOString() };
    }
  } catch (err) {
    // If rate limit check fails, allow the request (fail open)
    console.error('[RateLimiter] Error:', err);
    return { allowed: true, remaining: RATE_LIMIT, resetAt: new Date(now.getTime() + WINDOW_SECONDS * 1000).toISOString() };
  }
}
