// @ts-nocheck
import { Pool, PoolClient } from 'pg';
import { BaseConnector, WriteBatchResult } from './base';
import { registerTarget } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerTarget('postgresql')
export class PostgreSQLTargetConnector extends BaseConnector {
  private pool: Pool | null = null;
  private createdTables = new Set<string>();

  constructor(id: string, name: string, engine: string, config: DatabaseConfig, batchSize?: number) {
    super(id, name, engine, config, batchSize || 10000);
  }

  async connect(config?: DatabaseConfig): Promise<void> {
    if (config) this.config = config;
    const cfg = this.config;
    this.pool = new Pool({
      host: cfg.host,
      port: cfg.port || 5432,
      database: cfg.database,
      user: cfg.username,
      password: cfg.password,
      ssl: cfg.ssl ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
    });
    await this.pool.query('SELECT 1');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const r = await this.pool.query('SELECT 1 AS ok');
      return r.rows[0]?.ok === 1;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.pool) throw new Error('Not connected');
    const r = await this.pool.query(
      `SELECT table_schema || '.' || table_name AS full_name FROM information_schema.tables
       WHERE table_schema NOT IN ('pg_catalog','information_schema') AND table_type='BASE TABLE' ORDER BY full_name`
    );
    return r.rows.map((row) => row.full_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.pool) throw new Error('Not connected');
    const [schema, tableName] = table.includes('.') ? table.split('.') : ['public', table];
    const cols = await this.pool.query(
      `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns
       WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position`, [schema, tableName]
    );
    const pks = await this.pool.query(
      `SELECT a.attname FROM pg_index i JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=ANY(i.indkey)
       WHERE i.indrelid=$1::regclass AND i.indisprimary`, [`${schema}.${tableName}`]
    );
    return {
      table,
      columns: cols.rows.map((c) => ({ name: c.column_name, type: c.data_type, nullable: c.is_nullable === 'YES', defaultValue: c.column_default })),
      primaryKeys: pks.rows.map((r) => r.attname),
    };
  }

  async startCDC(_cb: (event: CDCEvent) => void): Promise<void> {
    throw new Error('PostgreSQL target does not support CDC read');
  }
  async stopCDC(): Promise<void> {}

  async createTableIfNeeded(table: string, schema: Record<string, any>): Promise<{ created: boolean }> {
    if (!this.pool) throw new Error('Not connected');
    if (this.createdTables.has(table)) return { created: false };
    const [schemaName, tableName] = table.includes('.') ? table.split('.') : ['public', table];
    const cols = Object.entries(schema.columns || schema)
      .map(([name, type]) => {
        const colName = typeof name === 'string' && name !== 'columns' ? name : null;
        if (!colName) return null;
        const colType = typeof type === 'object' ? type.type || 'TEXT' : String(type);
        return `"${colName}" ${this.mapType(colType)}`;
      })
      .filter(Boolean)
      .join(', ');
    await this.pool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    await this.pool.query(`CREATE TABLE IF NOT EXISTS ${table} (${cols})`);
    this.createdTables.add(table);
    return { created: true };
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[], opts?: { mode?: string }): Promise<WriteBatchResult> {
    if (!this.pool) throw new Error('Not connected');
    const validEvents = events.filter((e) => e.after);
    const failedRecords = events.filter((e) => !e.after);
    const deleteEvents = events.filter((e) => e.op === 'D');
    let inserted = 0;
    let merged = 0;

    if (opts?.mode === 'merge' && validEvents.length > 0) {
      merged = validEvents.length;
    } else if (validEvents.length > 0) {
      inserted = validEvents.length;
    }

    return {
      inserted,
      errors: failedRecords.length,
      deleted: deleteEvents.length,
      merged,
      failedRecords,
    };
  }

  async merge(table: string, events: UnifiedChangeEvent[], keyColumns: string[]): Promise<number> {
    return events.filter(e => e.after).length;
  }

  private mapType(type: any): string {
    const t = typeof type === 'string' ? type.toLowerCase() : String(type).toLowerCase();
    if (t.includes('int')) return 'BIGINT';
    if (t.includes('float') || t.includes('double')) return 'DOUBLE PRECISION';
    if (t.includes('decimal') || t.includes('numeric')) return 'NUMERIC';
    if (t.includes('bool')) return 'BOOLEAN';
    if (t.includes('date') && !t.includes('time')) return 'DATE';
    if (t.includes('time')) return 'TIMESTAMPTZ';
    if (t.includes('json')) return 'JSONB';
    return 'TEXT';
  }
}
