import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { query } from './_db';

// Admin password hash (SHA-256 of the password)
// Change this to your own password hash
const ADMIN_PASSWORD_HASH = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'; // SHA-256 of "pulsyn-admin-2026"

// Auto-block threshold for admin login failures
const ADMIN_FAILURE_THRESHOLD = 5;
const ADMIN_FAILURE_WINDOW_SECONDS = 900; // 15 minutes
const ADMIN_BLOCK_DURATION_HOURS = 2; // Block for 2 hours

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

async function isIpBlocked(ip: string): Promise<boolean> {
  try {
    const result = await query('SELECT * FROM is_ip_blocked($1)', [ip]);
    return result.rows[0]?.blocked || false;
  } catch {
    return false;
  }
}

async function logSecurityEvent(
  eventType: string,
  ip: string,
  details: Record<string, any>
): Promise<void> {
  try {
    await query(
      `SELECT log_security_event($1, $2, $3, $4, $5, $6, $7)`,
      [eventType, null, ip, 'Admin Dashboard', '/admin/security', 'POST', JSON.stringify(details)]
    );
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}

async function checkAndAutoBlockAdmin(ip: string): Promise<boolean> {
  try {
    // Count recent admin login failures
    const result = await query(
      `SELECT COUNT(*) as count FROM _pulsyn_security_log
       WHERE ip_address = $1
         AND event_type IN ('admin_login_failure', 'admin_login_blocked')
         AND created_at > NOW() - ($2 || ' seconds')::INTERVAL`,
      [ip, ADMIN_FAILURE_WINDOW_SECONDS]
    );

    const failureCount = parseInt(result.rows[0].count);

    if (failureCount >= ADMIN_FAILURE_THRESHOLD) {
      // Auto-block
      await query(
        `INSERT INTO _pulsyn_blocked_ips (ip_address, reason, blocked_by, failure_count, expires_at)
         VALUES ($1, $2, 'auto-admin-brute-force', $3, NOW() + ($4 || ' hours')::INTERVAL)
         ON CONFLICT (ip_address) DO UPDATE SET
           failure_count = EXCLUDED.failure_count,
           blocked_at = NOW(),
           expires_at = EXCLUDED.expires_at,
           unblocked_at = NULL,
           reason = EXCLUDED.reason`,
        [ip, `Auto-blocked: ${failureCount} admin login failures in ${ADMIN_FAILURE_WINDOW_SECONDS / 60} minutes`, failureCount, ADMIN_BLOCK_DURATION_HOURS]
      );

      await logSecurityEvent('admin_login_blocked', ip, {
        action: 'auto_blocked',
        failureCount,
        threshold: ADMIN_FAILURE_THRESHOLD,
        blockDurationHours: ADMIN_BLOCK_DURATION_HOURS,
      });

      return true;
    }

    return false;
  } catch (err) {
    console.error('Failed to check auto-block:', err);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);

  // Check if IP is already blocked
  if (await isIpBlocked(clientIp)) {
    await logSecurityEvent('admin_login_blocked', clientIp, {
      reason: 'ip_already_blocked',
    });

    return res.status(403).json({
      error: 'IP blocked',
      message: 'Your IP has been blocked due to too many failed attempts.',
    });
  }

  const { password } = req.body;

  if (!password) {
    await logSecurityEvent('admin_login_failure', clientIp, {
      reason: 'no_password',
    });

    return res.status(400).json({ error: 'Password required' });
  }

  // Hash the provided password
  const hash = crypto.createHash('sha256').update(password).digest('hex');

  if (hash !== ADMIN_PASSWORD_HASH) {
    // Log failed attempt
    await logSecurityEvent('admin_login_failure', clientIp, {
      reason: 'invalid_password',
      passwordLength: password.length,
    });

    // Check if we should auto-block
    const blocked = await checkAndAutoBlockAdmin(clientIp);

    if (blocked) {
      return res.status(403).json({
        error: 'Too many failed attempts',
        message: 'Your IP has been blocked for 2 hours due to too many failed login attempts.',
      });
    }

    return res.status(401).json({
      error: 'Invalid password',
      message: 'The admin password is incorrect.',
    });
  }

  // Success - log it
  await logSecurityEvent('admin_login_success', clientIp, {
    message: 'Admin dashboard access granted',
  });

  return res.json({
    data: {
      authenticated: true,
      message: 'Admin access granted',
    },
  });
}
