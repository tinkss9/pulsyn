import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, generateApiKey, authenticate } from '../_db';

// API Key management
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Require authentication for key management
  const authenticated = await authenticate(req, res);
  if (!authenticated) return;

  try {
    switch (req.method) {
      case 'GET': {
        // List API keys (masked)
        const result = await query(
          'SELECT id, name, organization_id, created_at, last_used_at FROM api_keys ORDER BY created_at DESC'
        );
        return res.json({
          data: result.rows.map(row => ({
            ...row,
            key: `${row.id.substring(0, 8)}...`, // Mask key
          })),
          total: result.rowCount,
        });
      }

      case 'POST': {
        // Create new API key
        const { name, organizationId } = req.body;

        if (!name) {
          return res.status(400).json({ error: 'Name is required' });
        }

        const key = generateApiKey();
        const id = `key-${Date.now()}`;

        await query(
          `INSERT INTO api_keys (id, key, name, organization_id)
           VALUES ($1, $2, $3, $4)`,
          [id, key, name, organizationId || 'default']
        );

        return res.status(201).json({
          data: {
            id,
            name,
            key, // Only shown once at creation
            organizationId: organizationId || 'default',
            message: 'Save this key securely. It will not be shown again.',
          },
        });
      }

      case 'DELETE': {
        // Delete API key
        const keyId = req.query.id as string;
        if (!keyId) {
          return res.status(400).json({ error: 'Key ID required' });
        }

        const result = await query('DELETE FROM api_keys WHERE id = $1', [keyId]);
        if (result.rowCount === 0) {
          return res.status(404).json({ error: 'Key not found' });
        }

        return res.json({ message: 'Key deleted' });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
