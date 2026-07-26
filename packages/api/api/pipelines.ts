import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, authenticate } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        // Public: List pipelines (no auth required for read)
        const result = await query('SELECT * FROM pipelines ORDER BY created_at DESC');
        return res.json({ data: result.rows, total: result.rowCount });
      }
      case 'POST': {
        // Protected: Create pipeline requires auth
        const authenticated = await authenticate(req, res);
        if (!authenticated) return;

        const { name, source, target, tables, config } = req.body;
        const id = `pipeline-${Date.now()}`;

        const result = await query(
          `INSERT INTO pipelines (id, name, source, target, tables, config)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [id, name, JSON.stringify(source), JSON.stringify(target), JSON.stringify(tables || []), JSON.stringify(config || {})]
        );

        return res.status(201).json({ data: result.rows[0] });
      }
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
