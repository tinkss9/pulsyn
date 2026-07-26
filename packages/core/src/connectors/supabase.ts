// @ts-nocheck
// Supabase Connector — PostgreSQL-compatible with Supabase-specific features
// Uses pg driver (same as PostgreSQL, Supabase is Postgres under the hood)

import { Pool } from 'pg';
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('supabase')
export class SupabaseConnector extends BaseConnector {
  private pool: Pool | null = null;
  private running = false;
  private pollingTimer: NodeJS.Timeout | null = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'supabase', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    // Supabase uses PostgreSQL under the hood with pooler connection
    this.pool = new Pool({
      host: config.host || `aws-0-${(config as any).region || 'us-east-1'}.pooler.supabase.com`,
      port: config.port || 6543,
      database: config.database || 'postgres',
      user: config.user || `postgres.${(config as any).projectRef || ''}`,
      password: config.password,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
    const client = await this.pool.connect();
    await client.query('SELECT 1');
    client.release();
    this.connected = true;
  }

  async disconnect(): Promise<void> { await this.stopCDC(); if (this.pool) { await this.pool.end(); this.pool = null; } this.connected = false; }
  async testConnection(): Promise<boolean> { try { const c = await this.pool!.connect(); await c.query('SELECT 1'); c.release(); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    const result = await this.pool!.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`);
    return result.rows.map(r => r.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const cols = await this.pool!.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`, [table]);
    const pks = await this.pool!.query(`SELECT a.attname as column_name FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) WHERE i.indisprimary AND i.indrelid = $1::regclass`, [table]);
    return {
      name: table,
      columns: cols.rows.map(r => ({ name: r.column_name, type: r.data_type, nullable: r.is_nullable === 'YES' })),
      primaryKey: pks.rows.map(r => r.column_name),
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const result = await this.pool!.query(`SELECT * FROM "${table}" LIMIT $1`, [this.batchSize]);
    return result.rows.map(row => createEvent({ op: 'S', table, after: row, watermark: String(row.id || 0) }));
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const sql = watermark ? `SELECT * FROM "${table}" WHERE id > $1 ORDER BY id LIMIT $2` : `SELECT * FROM "${table}" ORDER BY id LIMIT $1`;
    const params = watermark ? [watermark, this.batchSize] : [this.batchSize];
    const result = await this.pool!.query(sql, params);
    return result.rows.map(row => createEvent({ op: 'I', table, after: row, watermark: String(row.id || 0) }));
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.running = true;
    await this.setupChangeTracking();
    this.pollChanges(callback);
  }

  async stopCDC(): Promise<void> { this.running = false; if (this.pollingTimer) { clearInterval(this.pollingTimer); this.pollingTimer = null; } }

  private async setupChangeTracking(): Promise<void> {
    await this.pool!.query(`CREATE TABLE IF NOT EXISTS _pulsyn_changes (id BIGSERIAL PRIMARY KEY, table_name TEXT NOT NULL, operation TEXT NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')), row_data JSONB NOT NULL, old_data JSONB, changed_at TIMESTAMPTZ DEFAULT NOW(), processed BOOLEAN DEFAULT FALSE)`);
  }

  private pollChanges(callback: (event: CDCEvent) => void): void {
    const poll = async () => {
      if (!this.running || !this.pool) return;
      try {
        const result = await this.pool.query(`SELECT id, table_name, operation, row_data, old_data, changed_at FROM _pulsyn_changes WHERE processed = FALSE ORDER BY id ASC LIMIT 100`);
        for (const row of result.rows) {
          callback({ id: `evt-${row.id}`, operation: row.operation as any, table: row.table_name, timestamp: new Date(row.changed_at), data: row.row_data, oldData: row.old_data || undefined, lsn: String(row.id) });
        }
        if (result.rows.length > 0) await this.pool.query('UPDATE _pulsyn_changes SET processed = TRUE WHERE id <= $1', [result.rows[result.rows.length - 1].id]);
      } catch (err) { console.error('[Supabase CDC] Poll error:', err); }
    };
    poll();
    this.pollingTimer = setInterval(poll, 1000);
  }
}



