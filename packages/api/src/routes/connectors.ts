// Connector Routes — PostgreSQL backed with real connection testing

import { Router, Request, Response } from 'express';
import { query } from '../db';
import { Pool } from 'pg';

export const connectorRoutes = Router();

// List all connectors
connectorRoutes.get('/', async (req: Request, res: Response) => {
  const result = await query(
    'SELECT id, name, engine, status, created_at, updated_at FROM connectors ORDER BY created_at DESC'
  );
  res.json({ data: result.rows, total: result.rowCount });
});

// Get connector by ID
connectorRoutes.get('/:id', async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM connectors WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Connector not found' });
  }
  // Don't expose password in response
  const connector = result.rows[0];
  if (connector.config?.password) {
    connector.config = { ...connector.config, password: '***' };
  }
  res.json({ data: connector });
});

// Create connector
connectorRoutes.post('/', async (req: Request, res: Response) => {
  const { name, engine, config } = req.body;
  const id = `connector-${Date.now()}`;

  const result = await query(
    `INSERT INTO connectors (id, name, engine, config)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, name, engine, JSON.stringify(config)]
  );

  const connector = result.rows[0];
  if (connector.config?.password) {
    connector.config = { ...connector.config, password: '***' };
  }
  res.status(201).json({ data: connector });
});

// Test connector connection (REAL connection test)
connectorRoutes.post('/:id/test', async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM connectors WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Connector not found' });
  }

  const connector = result.rows[0];
  const config = connector.config;

  const start = Date.now();
  let testPool: Pool | null = null;

  try {
    testPool = new Pool({
      host: config.host || 'localhost',
      port: config.port || 5432,
      database: config.database || config.db,
      user: config.user || config.username,
      password: config.password,
      connectionTimeoutMillis: 5000,
      max: 1,
    });

    const client = await testPool.connect();
    const pgResult = await client.query('SELECT version()');
    client.release();

    const latency = Date.now() - start;

    await query(
      `UPDATE connectors SET status = 'connected', updated_at = NOW() WHERE id = $1`,
      [connector.id]
    );

    res.json({
      data: {
        connectorId: connector.id,
        status: 'connected',
        latency,
        version: pgResult.rows[0]?.version,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    await query(
      `UPDATE connectors SET status = 'error', updated_at = NOW() WHERE id = $1`,
      [connector.id]
    );

    res.json({
      data: {
        connectorId: connector.id,
        status: 'error',
        error: err.message,
        latency: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
    });
  } finally {
    if (testPool) await testPool.end().catch(() => {});
  }
});

// Get connector tables (REAL query)
connectorRoutes.get('/:id/tables', async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM connectors WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Connector not found' });
  }

  const connector = result.rows[0];
  const config = connector.config;
  let testPool: Pool | null = null;

  try {
    testPool = new Pool({
      host: config.host || 'localhost',
      port: config.port || 5432,
      database: config.database || config.db,
      user: config.user || config.username,
      password: config.password,
      connectionTimeoutMillis: 5000,
      max: 1,
    });

    const client = await testPool.connect();
    const tablesResult = await client.query(`
      SELECT table_name as name,
             (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    client.release();

    res.json({ data: tablesResult.rows });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch tables: ${err.message}` });
  } finally {
    if (testPool) await testPool.end().catch(() => {});
  }
});

// Get table schema (REAL query)
connectorRoutes.get('/:id/tables/:table/schema', async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM connectors WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Connector not found' });
  }

  const connector = result.rows[0];
  const config = connector.config;
  let testPool: Pool | null = null;

  try {
    testPool = new Pool({
      host: config.host || 'localhost',
      port: config.port || 5432,
      database: config.database || config.db,
      user: config.user || config.username,
      password: config.password,
      connectionTimeoutMillis: 5000,
      max: 1,
    });

    const client = await testPool.connect();

    const columnsResult = await client.query(`
      SELECT column_name as name,
             data_type as type,
             is_nullable as nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [req.params.table]);

    const pkResult = await client.query(`
      SELECT a.attname as name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass AND i.indisprimary
    `, [req.params.table]);

    client.release();

    res.json({
      data: {
        name: req.params.table,
        columns: columnsResult.rows.map((c: any) => ({
          name: c.name,
          type: c.type,
          nullable: c.nullable === 'YES',
        })),
        primaryKey: pkResult.rows.map((r: any) => r.name),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch schema: ${err.message}` });
  } finally {
    if (testPool) await testPool.end().catch(() => {});
  }
});

// Delete connector
connectorRoutes.delete('/:id', async (req: Request, res: Response) => {
  const result = await query('DELETE FROM connectors WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Connector not found' });
  }
  res.status(204).send();
});
