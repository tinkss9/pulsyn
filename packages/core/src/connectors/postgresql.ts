// PostgreSQL Connector
// Real CDC using trigger-based change tracking + optional logical replication

import { Pool, PoolConfig } from 'pg';
import { BaseConnector } from './base';
import {
  DatabaseConfig,
  TableSchema,
  CDCEvent,
  ColumnSchema,
} from '../types';

export interface CDCOptions {
  pollIntervalMs?: number; // How often to poll for changes (default: 1000ms)
  batchSize?: number; // Max changes per poll (default: 1000)
  useTriggers?: boolean; // Use trigger-based CDC (default: true)
  slotName?: string; // Replication slot name (for logical replication)
  publicationName?: string; // Publication name
}

export class PostgreSQLConnector extends BaseConnector {
  private pool: Pool | null = null;
  private cdcOptions: CDCOptions;
  private pollingTimer: NodeJS.Timeout | null = null;
  private lastChangeId: bigint = BigInt(0);
  private running: boolean = false;

  constructor(id: string, name: string, config: DatabaseConfig, options: CDCOptions = {}) {
    super(id, name, 'postgresql', config);
    this.cdcOptions = {
      pollIntervalMs: 1000,
      batchSize: 1000,
      useTriggers: true,
      slotName: 'pulsyn_slot',
      publicationName: 'pulsyn_pub',
      ...options,
    };
  }

  async connect(config: DatabaseConfig): Promise<void> {
    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

    this.pool = new Pool(poolConfig);

    // Test connection
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

    const result = await this.pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '_pulsyn_%'
      ORDER BY table_name
    `);

    return result.rows.map((row: any) => row.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.pool) throw new Error('Not connected');

    const columnsResult = await this.pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = $1
      ORDER BY ordinal_position
    `, [table]);

    const columns: ColumnSchema[] = columnsResult.rows.map((row: any) => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES',
      defaultValue: row.column_default,
    }));

    const pkResult = await this.pool.query(`
      SELECT column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
      ORDER BY kcu.ordinal_position
    `, [table]);

    const primaryKey = pkResult.rows.map((row: any) => row.column_name);

    return { name: table, columns, primaryKey };
  }

  // ─── CDC Implementation ─────────────────────────────────────

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.pool) throw new Error('Not connected');
    if (this.running) throw new Error('CDC already running');

    console.log(`[PostgreSQL CDC] Starting CDC for ${this.config.database}`);

    // Set up change tracking infrastructure
    await this.setupChangeTracking();

    // Set up triggers on watched tables
    await this.setupTriggers();

    // Start polling for changes
    this.running = true;
    this.pollChanges(callback);

    console.log(`[PostgreSQL CDC] CDC started. Polling every ${this.cdcOptions.pollIntervalMs}ms`);
  }

  async stopCDC(): Promise<void> {
    this.running = false;
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    console.log(`[PostgreSQL CDC] CDC stopped for ${this.config.database}`);
  }

  private async setupChangeTracking(): Promise<void> {
    if (!this.pool) return;

    // Create changes table if it doesn't exist
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

      CREATE INDEX IF NOT EXISTS idx_pulsyn_changes_processed
        ON _pulsyn_changes (processed, id);

      CREATE INDEX IF NOT EXISTS idx_pulsyn_changes_table
        ON _pulsyn_changes (table_name, id);
    `);

    console.log('[PostgreSQL CDC] Change tracking table ready');
  }

  private async setupTriggers(): Promise<void> {
    if (!this.pool) return;

    // Get all user tables
    const tables = await this.getTables();

    for (const table of tables) {
      await this.createTriggerForTable(table);
    }

    console.log(`[PostgreSQL CDC] Triggers set up on ${tables.length} tables`);
  }

  private async createTriggerForTable(table: string): Promise<void> {
    if (!this.pool) return;

    // Create trigger function for this table
    await this.pool.query(`
      CREATE OR REPLACE FUNCTION _pulsyn_capture_${table}()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'DELETE' THEN
          INSERT INTO _pulsyn_changes (table_name, operation, row_data, old_data)
          VALUES (TG_TABLE_NAME, 'DELETE', row_to_json(OLD), NULL);
          RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
          INSERT INTO _pulsyn_changes (table_name, operation, row_data, old_data)
          VALUES (TG_TABLE_NAME, 'UPDATE', row_to_json(NEW), row_to_json(OLD));
          RETURN NEW;
        ELSIF TG_OP = 'INSERT' THEN
          INSERT INTO _pulsyn_changes (table_name, operation, row_data, old_data)
          VALUES (TG_TABLE_NAME, 'INSERT', row_to_json(NEW), NULL);
          RETURN NEW;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Drop existing trigger if exists, then create new one
    await this.pool.query(`
      DROP TRIGGER IF EXISTS _pulsyn_trigger_${table} ON "${table}";

      CREATE TRIGGER _pulsyn_trigger_${table}
        AFTER INSERT OR UPDATE OR DELETE ON "${table}"
        FOR EACH ROW
        EXECUTE FUNCTION _pulsyn_capture_${table}();
    `);
  }

  private pollChanges(callback: (event: CDCEvent) => void): void {
    const poll = async () => {
      if (!this.running || !this.pool) return;

      try {
        // Fetch unprocessed changes
        const result = await this.pool.query(`
          SELECT id, table_name, operation, row_data, old_data, changed_at
          FROM _pulsyn_changes
          WHERE id > $1 AND processed = FALSE
          ORDER BY id ASC
          LIMIT $2
        `, [this.lastChangeId.toString(), this.cdcOptions.batchSize]);

        if (result.rows.length === 0) return;

        // Process each change
        for (const row of result.rows) {
          const event: CDCEvent = {
            id: `evt-${row.id}`,
            operation: row.operation as 'INSERT' | 'UPDATE' | 'DELETE',
            table: row.table_name,
            timestamp: new Date(row.changed_at),
            data: row.row_data,
            oldData: row.old_data || undefined,
            lsn: row.id.toString(),
          };

          callback(event);

          // Update last processed ID
          this.lastChangeId = BigInt(row.id);
        }

        // Mark changes as processed
        const maxId = result.rows[result.rows.length - 1].id;
        await this.pool.query(`
          UPDATE _pulsyn_changes
          SET processed = TRUE
          WHERE id <= $1
        `, [maxId]);

      } catch (error) {
        console.error('[PostgreSQL CDC] Poll error:', error);
      }
    };

    // Initial poll
    poll();

    // Set up interval polling
    this.pollingTimer = setInterval(poll, this.cdcOptions.pollIntervalMs);
  }

  // ─── Checkpoint Management ──────────────────────────────────

  async getCheckpoint(): Promise<{ lastChangeId: string; timestamp: Date }> {
    return {
      lastChangeId: this.lastChangeId.toString(),
      timestamp: new Date(),
    };
  }

  async restoreCheckpoint(lastChangeId: string): Promise<void> {
    this.lastChangeId = BigInt(lastChangeId);
    console.log(`[PostgreSQL CDC] Restored checkpoint to change ID ${lastChangeId}`);
  }

  // ─── Utility Methods ────────────────────────────────────────

  async getChangeCount(): Promise<number> {
    if (!this.pool) return 0;
    const result = await this.pool.query(`
      SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE
    `);
    return parseInt(result.rows[0].count);
  }

  async getTableChangeCount(table: string): Promise<number> {
    if (!this.pool) return 0;
    const result = await this.pool.query(`
      SELECT COUNT(*) as count FROM _pulsyn_changes
      WHERE table_name = $1 AND processed = FALSE
    `, [table]);
    return parseInt(result.rows[0].count);
  }

  async cleanupProcessedChanges(olderThanHours: number = 24): Promise<number> {
    if (!this.pool) return 0;
    const result = await this.pool.query(`
      DELETE FROM _pulsyn_changes
      WHERE processed = TRUE
      AND changed_at < NOW() - INTERVAL '${olderThanHours} hours'
    `);
    return result.rowCount || 0;
  }
}
