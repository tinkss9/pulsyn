import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const result = await query('SELECT id, name, engine, status, created_at FROM connectors ORDER BY created_at DESC');
        return res.json({ data: result.rows, total: result.rowCount });
      }
      case 'POST': {
        const { name, engine, config } = req.body;
        const id = `connector-${Date.now()}`;

        const result = await query(
          `INSERT INTO connectors (id, name, engine, config)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [id, name, engine, JSON.stringify(config)]
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
