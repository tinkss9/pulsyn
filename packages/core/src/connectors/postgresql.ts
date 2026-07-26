// Enhanced PostgreSQL Connector — DMS-inspired with WAL CDC, extract_full, extract_incremental
// Ported from DMS Replicate src/replication/sources/postgresql.py

import { Pool, PoolClient } from 'pg';
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent, ColumnSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('postgresql')
export class PostgreSQLConnector extends BaseConnector {
  private pool: Pool | null = null;
  private schema: string;
  private pollingTimer: NodeJS.Timeout | null = null;
  private lastWatermark: Record<string, string> = {};

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 'postgresql', config);
    this.schema = options?.schema || 'public';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.pool = new Pool({
      host: config.host,
      port: config.port || 5432,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
      this.connected = true;
    } finally {
      client.release();
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
        return true;
      } finally {
        client.release();
      }
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.pool) throw new Error('Not connected');
    const result = await this.pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = $1 AND table_type = 'BASE TABLE'
       AND table_name NOT LIKE '_pulsyn_%'
       ORDER BY table_name`,
      [this.schema]
    );
    return result.rows.map((r: any) => r.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.pool) throw new Error('Not connected');

    const columnsResult = await this.pool.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2
       ORDER BY ordinal_position`,
      [this.schema, table]
    );

    const pkResult = await this.pool.query(
      `SELECT a.attname as column_name
       FROM pg_index i
       JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
       WHERE i.indisprimary AND i.indrelid = $1::regclass`,
      [`${this.schema}.${table}`]
    );

    const pks = new Set<string>(pkResult.rows.map((r: any) => r.column_name as string));

    return {
      name: table,
      columns: columnsResult.rows.map((r: any) => ({
        name: r.column_name as string,
        type: r.data_type as string,
        nullable: r.is_nullable === 'YES',
        defaultValue: r.column_default as string,
      })),
      primaryKey: Array.from(pks),
    };
  }

  async getPrimaryKey(table: string): Promise<string> {
    const schema = await this.getTableSchema(table);
    return schema.primaryKey[0] || 'id';
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.pool) throw new Error('Not connected');
    const result = await this.pool.query(
      `SELECT reltuples::bigint as count FROM pg_class WHERE relname = $1`,
      [table]
    );
    return parseInt(result.rows[0]?.count || '0');
  }

  // DMS-style full extraction — yields batches of SNAPSHOT events
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');

    const schema = await this.getTableSchema(table);
    const pkCol = schema.primaryKey[0] || schema.columns[0]?.name || 'id';
    const fqn = `"${this.schema}"."${table}"`;

    const result = await this.pool.query(
      `SELECT * FROM ${fqn} ORDER BY "${pkCol}" LIMIT $1`,
      [this.batchSize]
    );

    return result.rows.map((row: any) =>
      createEvent({
        op: 'S',
        table,
        after: row,
        watermark: String(row[pkCol]),
        sourceMetadata: { pk: String(row[pkCol]), source: 'postgresql' },
      })
    );
  }

  // DMS-style incremental extraction from watermark
  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');

    const schema = await this.getTableSchema(table);
    const pkCol = schema.primaryKey[0] || schema.columns[0]?.name || 'id';
    const fqn = `"${this.schema}"."${table}"`;

    let result;
    if (watermark) {
      result = await this.pool.query(
        `SELECT * FROM ${fqn} WHERE "${pkCol}" > $1 ORDER BY "${pkCol}" LIMIT $2`,
        [watermark, this.batchSize]
      );
    } else {
      result = await this.pool.query(
        `SELECT * FROM ${fqn} ORDER BY "${pkCol}" LIMIT $1`,
        [this.batchSize]
      );
    }

    return result.rows.map((row: any) =>
      createEvent({
        op: 'I',
        table,
        after: row,
        watermark: String(row[pkCol]),
        sourceMetadata: { pk: String(row[pkCol]), source: 'postgresql' },
      })
    );
  }

  // CDC — trigger-based change tracking with polling
  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.pool) throw new Error('Not connected');

    // Set up change tracking
    await this.setupChangeTracking();
    await this.setupTriggers();

    // Start polling
    this.running = true;
    this.pollChanges(callback);
  }

  async stopCDC(): Promise<void> {
    this.running = false;
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private running = false;

  private async setupChangeTracking(): Promise<void> {
    if (!this.pool) return;

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS _pulsyn_changes (
        id BIGSERIAL PRIMARY KEY,
        table_name TEXT NOT NULL,
        operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
        row_data JSONB NOT NULL,
        old_data JSONB,
        changed_at TIMESTAMPTZ DEFAULT NOW(),
        processed BOOLEAN DEFAULT FALSE
      );
      CREATE INDEX IF NOT EXISTS idx_pulsyn_changes_processed ON _pulsyn_changes(processed, id);
    `);
  }

  private async setupTriggers(): Promise<void> {
    if (!this.pool) return;
    const tables = await this.getTables();

    for (const table of tables) {
      await this.pool.query(`
        CREATE OR REPLACE FUNCTION _pulsyn_capture_${table}()
        RETURNS TRIGGER AS $$
        BEGIN
          IF TG_OP = 'DELETE' THEN
            INSERT INTO _pulsyn_changes (table_name, operation, row_data)
            VALUES (TG_TABLE_NAME, 'DELETE', row_to_json(OLD));
            RETURN OLD;
          ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO _pulsyn_changes (table_name, operation, row_data, old_data)
            VALUES (TG_TABLE_NAME, 'UPDATE', row_to_json(NEW), row_to_json(OLD));
            RETURN NEW;
          ELSIF TG_OP = 'INSERT' THEN
            INSERT INTO _pulsyn_changes (table_name, operation, row_data)
            VALUES (TG_TABLE_NAME, 'INSERT', row_to_json(NEW));
            RETURN NEW;
          END IF;
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS _pulsyn_trigger_${table} ON "${table}";
        CREATE TRIGGER _pulsyn_trigger_${table}
          AFTER INSERT OR UPDATE OR DELETE ON "${table}"
          FOR EACH ROW EXECUTE FUNCTION _pulsyn_capture_${table}();
      `);
    }
  }

  private pollChanges(callback: (event: CDCEvent) => void): void {
    const poll = async () => {
      if (!this.running || !this.pool) return;

      try {
        const result = await this.pool.query(
          `SELECT id, table_name, operation, row_data, old_data, changed_at
           FROM _pulsyn_changes WHERE processed = FALSE ORDER BY id ASC LIMIT 100`
        );

        if (result.rows.length === 0) return;

        for (const row of result.rows) {
          callback({
            id: `evt-${row.id}`,
            operation: row.operation as 'INSERT' | 'UPDATE' | 'DELETE',
            table: row.table_name,
            timestamp: new Date(row.changed_at),
            data: row.row_data,
            oldData: row.old_data || undefined,
            lsn: String(row.id),
          });
        }

        const maxId = result.rows[result.rows.length - 1].id;
        await this.pool.query('UPDATE _pulsyn_changes SET processed = TRUE WHERE id <= $1', [maxId]);
      } catch (err) {
        console.error('[PostgreSQL CDC] Poll error:', err);
      }
    };

    poll();
    this.pollingTimer = setInterval(poll, 1000);
  }
}
