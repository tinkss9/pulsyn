// @ts-nocheck
import { Pool, Client } from 'pg';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('postgresql')
export class PostgreSQLConnector extends BaseConnector {
  private pool: Pool | null = null;
  private replicationClient: Client | null = null;
  private cdcActive = false;

  async connect(config?: DatabaseConfig): Promise<void> {
    return this.withRetry(async () => {
      try {
        if (config) this.config = config;
        const cfg = this.config;
        const connectTimeout = (cfg as any).connectTimeout || 30000;
        this.pool = new Pool({
          host: cfg.host,
          port: cfg.port || 5432,
          database: cfg.database,
          user: cfg.username,
          password: cfg.password,
          ssl: cfg.ssl ? { rejectUnauthorized: false } : undefined,
          max: 10,
          connectionTimeoutMillis: connectTimeout,
        });
        await this.pool.query('SELECT 1');
        this.connected = true;
      } catch (error) {
        throw new Error(`PostgreSQL connection failed: ${(error as Error).message}`);
      }
    });
  }

  async disconnect(): Promise<void> {
    try {
      await this.stopCDC();
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
      }
      this.connected = false;
    } catch (error) {
      throw new Error(`PostgreSQL disconnect failed: ${(error as Error).message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const result = await this.pool.query('SELECT 1 AS ok');
      return result.rows[0]?.ok === 1;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.pool) throw new Error('Not connected');
    try {
      const result = await this.pool.query(
        `SELECT table_schema || '.' || table_name AS full_name
         FROM information_schema.tables
         WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
           AND table_type = 'BASE TABLE' ORDER BY full_name`
      );
      return result.rows.map((r) => r.full_name);
    } catch (error) {
      throw new Error(`Failed to list tables: ${(error as Error).message}`);
    }
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.pool) throw new Error('Not connected');
    try {
      const [schema, tableName] = table.includes('.') ? table.split('.') : ['public', table];
      const cols = await this.pool.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position`,
        [schema, tableName]
      );
      const pks = await this.pool.query(
        `SELECT a.attname FROM pg_index i
         JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
         WHERE i.indrelid = $1::regclass AND i.indisprimary`,
        [`${schema}.${tableName}`]
      );
      const pkSet = new Set(pks.rows.map((r) => r.attname));
      return {
        name: table,
        table,
        columns: cols.rows.map((c) => ({
          name: c.column_name, type: c.data_type,
          nullable: c.is_nullable === 'YES', defaultValue: c.column_default,
          primaryKey: pkSet.has(c.column_name),
        })),
        primaryKey: pks.rows.map((r) => r.attname),
        primaryKeys: pks.rows.map((r) => r.attname),
      };
    } catch (error) {
      throw new Error(`Failed to get schema for ${table}: ${(error as Error).message}`);
    }
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.config) throw new Error('Not connected');
    try {
      const slotName = `pulsyn_${this.id.replace(/-/g, '_')}`;
      this.replicationClient = new Client({
        host: this.config.host, port: this.config.port || 5432,
        database: this.config.database, user: this.config.username,
        password: this.config.password, replication: 'database',
      });
      await this.replicationClient.connect();
      try {
        await this.replicationClient.query(
          `SELECT pg_create_logical_replication_slot('${slotName}', 'wal2json')`
        );
      } catch { /* slot may already exist */ }
      this.cdcActive = true;
      this.pollSlot(slotName, callback);
    } catch (error) {
      throw new Error(`Failed to start CDC: ${(error as Error).message}`);
    }
  }

  private async pollSlot(slot: string, cb: (event: CDCEvent) => void): Promise<void> {
    while (this.cdcActive && this.replicationClient) {
      try {
        const res = await this.replicationClient.query(
          `SELECT data FROM pg_logical_slot_get_changes('${slot}', NULL, ${this.batchSize})`
        );
        for (const row of res.rows) {
          const change = JSON.parse(row.data);
          for (const c of change.change || []) {
            const op = c.kind === 'insert' ? 'I' : c.kind === 'update' ? 'U' : 'D';
            cb({
              op, table: `${c.schema}.${c.table}`,
              before: c.oldkeys ? this.zip(c.oldkeys.keynames, c.oldkeys.keyvalues) : null,
              after: c.columnvalues ? this.zip(c.columnnames, c.columnvalues) : null,
              ts: new Date(),
            });
          }
        }
        await new Promise((r) => setTimeout(r, 1000));
      } catch {
        if (this.cdcActive) await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  private zip(names: string[], values: any[]): Record<string, any> {
    const obj: Record<string, any> = {};
    names.forEach((n, i) => { obj[n] = values[i]; });
    return obj;
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.replicationClient) {
      try { await this.replicationClient.end(); } catch { /* ignore */ }
      this.replicationClient = null;
    }
  }

  async extractFull(table: string, opts?: { limit?: number; offset?: number }): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const schema = await this.getTableSchema(table);
    const pk = schema.primaryKeys[0] || 'id';
    const events: UnifiedChangeEvent[] = [];
    const limit = opts?.limit || this.batchSize;
    let lastKey: any = null;
    let offset = opts?.offset || 0;

    while (true) {
      const q = lastKey
        ? `SELECT * FROM ${table} WHERE ${pk} > $1 ORDER BY ${pk} LIMIT $2`
        : `SELECT * FROM ${table} ORDER BY ${pk} LIMIT $1 OFFSET $2`;
      const p = lastKey ? [lastKey, limit] : [limit, offset];
      const result = await this.pool.query(q, p);
      if (result.rows.length === 0) break;
      for (const row of result.rows) {
        events.push(createEvent({
          op: 'S', table,
          after: row,
          before: null,
          sourceMetadata: { source: 'postgresql', pk: row[pk]?.toString() || null },
        }));
      }
      lastKey = result.rows[result.rows.length - 1][pk];
      if (result.rows.length < limit) break;
    }
    return events;
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const wmCol = opts?.watermarkColumn || this.config.watermarkColumn || 'updated_at';
    const watermark = opts?.watermarkValue || null;
    const events: UnifiedChangeEvent[] = [];
    const q = watermark
      ? `SELECT * FROM ${table} WHERE ${wmCol} > $1 ORDER BY ${wmCol} LIMIT $2`
      : `SELECT * FROM ${table} ORDER BY ${wmCol} LIMIT $1`;
    const p = watermark ? [watermark, this.batchSize] : [this.batchSize];
    const result = await this.pool.query(q, p);
    for (const row of result.rows) {
      events.push(createEvent({
        op: 'I', table,
        after: row,
        before: null,
        sourceMetadata: { source: 'postgresql', pk: row[wmCol]?.toString() || null },
      }));
    }
    return events;
  }
}
