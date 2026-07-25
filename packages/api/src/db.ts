// PostgreSQL connection pool
import { Pool, PoolClient, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/pulsyn',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[Pulsyn DB] Unexpected error on idle client', err);
});

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 100) {
    console.warn(`[Pulsyn DB] Slow query (${duration}ms):`, text.substring(0, 100));
  }
  return result;
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function initDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS pipelines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        source JSONB NOT NULL,
        target JSONB NOT NULL,
        tables JSONB DEFAULT '[]',
        status TEXT DEFAULT 'idle',
        stats JSONB DEFAULT '{"rowsRead":0,"rowsWritten":0,"rowsPerSecond":0,"lagMs":0,"errors":0}',
        config JSONB DEFAULT '{}',
        started_at TIMESTAMPTZ,
        stopped_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS connectors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        engine TEXT NOT NULL,
        config JSONB NOT NULL,
        status TEXT DEFAULT 'disconnected',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS checkpoints (
        id TEXT PRIMARY KEY,
        pipeline_id TEXT NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
        lsn TEXT,
        data JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        organization_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_used_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        organization_id TEXT UNIQUE NOT NULL,
        plan_id TEXT NOT NULL DEFAULT 'community',
        status TEXT DEFAULT 'active',
        stripe_subscription_id TEXT,
        stripe_customer_id TEXT,
        current_period_start TIMESTAMPTZ DEFAULT NOW(),
        current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS usage_records (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL,
        metric TEXT NOT NULL,
        quantity BIGINT NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_checkpoints_pipeline ON checkpoints(pipeline_id);
      CREATE INDEX IF NOT EXISTS idx_usage_org_metric ON usage_records(organization_id, metric);
      CREATE INDEX IF NOT EXISTS idx_usage_created ON usage_records(created_at);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);
    `);
    console.log('[Pulsyn DB] Schema initialized');
  } finally {
    client.release();
  }
}

export default pool;
