import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, authenticate } from '../_db';

// Security events and audit log viewer
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authenticated = await authenticate(req, res);
  if (!authenticated) return;

  try {
    const type = req.query.type as string || 'recent';
    const limit = parseInt(req.query.limit as string) || 100;

    let result;

    switch (type) {
      case 'suspicious':
        // IPs with multiple failures in the last hour
        result = await query('SELECT * FROM v_pulsyn_suspicious_ips');
        return res.json({
          data: {
            type: 'suspicious_ips',
            items: result.rows,
            message: 'IPs with >5 failures in the last hour',
          },
        });

      case 'rate_limits':
        // Rate limit violations in last 24 hours
        result = await query('SELECT * FROM v_pulsyn_rate_limit_violations');
        return res.json({
          data: {
            type: 'rate_limit_violations',
            items: result.rows,
            message: 'Rate limit violations in the last 24 hours',
          },
        });

      case 'failures':
        // Auth failures only
        result = await query(
          `SELECT * FROM _pulsyn_security_log
           WHERE event_type IN ('auth_failure', 'invalid_key', 'cron_auth_failure')
           ORDER BY created_at DESC
           LIMIT $1`,
          [limit]
        );
        return res.json({
          data: {
            type: 'auth_failures',
            items: result.rows,
            total: result.rowCount,
          },
        });

      case 'summary':
        // Summary stats
        result = await query(`
          SELECT
            event_type,
            COUNT(*) as count,
            MAX(created_at) as last_seen
          FROM _pulsyn_security_log
          WHERE created_at > NOW() - INTERVAL '24 hours'
          GROUP BY event_type
          ORDER BY count DESC
        `);
        return res.json({
          data: {
            type: 'summary',
            period: '24 hours',
            events: result.rows,
          },
        });

      case 'recent':
      default:
        // Recent events
        result = await query(
          `SELECT * FROM _pulsyn_security_log
           ORDER BY created_at DESC
           LIMIT $1`,
          [limit]
        );
        return res.json({
          data: {
            type: 'recent',
            items: result.rows,
            total: result.rowCount,
          },
        });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
