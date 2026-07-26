import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, authenticate } from './_db';

// Blocked IPs management
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authenticated = await authenticate(req, res);
  if (!authenticated) return;

  try {
    switch (req.method) {
      case 'GET': {
        const status = req.query.status as string || 'active';
        let sql: string;

        switch (status) {
          case 'active':
            sql = `SELECT * FROM v_pulsyn_blocked_ips WHERE status = 'active' ORDER BY blocked_at DESC`;
            break;
          case 'all':
            sql = `SELECT * FROM v_pulsyn_blocked_ips ORDER BY blocked_at DESC LIMIT 100`;
            break;
          case 'expired':
            sql = `SELECT * FROM v_pulsyn_blocked_ips WHERE status IN ('expired', 'unblocked') ORDER BY blocked_at DESC LIMIT 100`;
            break;
          default:
            sql = `SELECT * FROM v_pulsyn_blocked_ips ORDER BY blocked_at DESC LIMIT 100`;
        }

        const result = await query(sql);
        return res.json({
          data: {
            blockedIps: result.rows,
            total: result.rowCount,
            status,
          },
        });
      }

      case 'POST': {
        // Manual block
        const { ip, reason, durationHours } = req.body;

        if (!ip) {
          return res.status(400).json({ error: 'IP address required' });
        }

        const duration = durationHours || 24;
        await query(
          `INSERT INTO _pulsyn_blocked_ips (ip_address, reason, blocked_by, expires_at)
           VALUES ($1, $2, 'manual', NOW() + ($3 || ' hours')::INTERVAL)
           ON CONFLICT (ip_address) DO UPDATE SET
             reason = EXCLUDED.reason,
             blocked_at = NOW(),
             expires_at = EXCLUDED.expires_at,
             unblocked_at = NULL`,
          [ip, reason || 'Manual block', duration]
        );

        return res.json({
          data: {
            ip,
            status: 'blocked',
            reason: reason || 'Manual block',
            expiresAt: new Date(Date.now() + duration * 3600000).toISOString(),
          },
        });
      }

      case 'DELETE': {
        // Unblock IP
        const unblockIp = req.query.ip as string;

        if (!unblockIp) {
          return res.status(400).json({ error: 'IP address required' });
        }

        const result = await query('SELECT unblock_ip($1) as unblocked', [unblockIp]);
        const unblocked = result.rows[0].unblocked;

        if (!unblocked) {
          return res.status(404).json({ error: 'IP not found or already unblocked' });
        }

        return res.json({
          data: {
            ip: unblockIp,
            status: 'unblocked',
          },
        });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
