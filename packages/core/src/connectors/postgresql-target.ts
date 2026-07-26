// @ts-nocheck
import { Pool, PoolClient } from 'pg';
import { Readable } from 'stream';
import { BaseConnector } from './base';
import { registerTarget } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerTarget('postgresql')
export class PostgreSQLTargetConnector extends BaseConnector {
  private pool: Pool | null = null;

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 'postgresql', config, options?.batchSize || 10000);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.pool = new Pool({
      host: config.host,
      port: config.port || 5432,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
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

  async createTableIfNeeded(table: string, schema: Record<string, any>): Promise<void> {
    if (!this.pool) throw new Error('Not connected');
    const [schemaName, tableName] = table.includes('.') ? table.split('.') : ['public', table];
    const cols = Object.entries(schema)
      .map(([name, type]) => `"${name}" ${this.mapType(type)}`)
      .join(', ');
    await this.pool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    await this.pool.query(`CREATE TABLE IF NOT EXISTS ${table} (${cols})`);
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    if (!this.pool) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    const columns = Object.keys(rows[0]);
    let written = 0;
    const client = await this.pool.connect();
    try {
      for (let i = 0; i < rows.length; i += this.batchSize) {
        const batch = rows.slice(i, i + this.batchSize);
        const copySQL = `COPY ${table} (${columns.map((c) => `"${c}"`).join(',')}) FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\N')`;

        const stream = client.query(require('pg-copy-streams').from(copySQL));
        const readable = new Readable({ read() {} });
        readable.pipe(stream);

        for (const row of batch) {
          const line = columns.map((c) => {
            const v = row[c];
            if (v === null || v === undefined) return '\\N';
            if (v instanceof Date) return v.toISOString();
            if (typeof v === 'object') return JSON.stringify(v).replace(/\t/g, ' ').replace(/\n/g, '\\n');
            return String(v).replace(/\t/g, ' ').replace(/\n/g, '\\n');
          }).join('\t');
          readable.push(line + '\n');
        }
        readable.push(null);

        await new Promise<void>((resolve, reject) => {
          stream.on('finish', resolve);
          stream.on('error', reject);
        });
        written += batch.length;
      }
    } finally {
      client.release();
    }
    return written;
  }

  async merge(table: string, events: UnifiedChangeEvent[], keyColumns: string[]): Promise<number> {
    if (!this.pool) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    const columns = Object.keys(rows[0]);
    const nonKeyCols = columns.filter((c) => !keyColumns.includes(c));
    let merged = 0;
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      for (let i = 0; i < rows.length; i += this.batchSize) {
        const batch = rows.slice(i, i + this.batchSize);
        // Build multi-row INSERT ... ON CONFLICT
        const valueClauses: string[] = [];
        const params: any[] = [];
        let paramIdx = 1;

        for (const row of batch) {
          const placeholders = columns.map(() => `$${paramIdx++}`);
          valueClauses.push(`(${placeholders.join(',')})`);
          columns.forEach((c) => params.push(row[c] ?? null));
        }

        const conflictTarget = keyColumns.map((k) => `"${k}"`).join(',');
        const updateSet = nonKeyCols.map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');
        const sql = `INSERT INTO ${table} (${columns.map((c) => `"${c}"`).join(',')}) VALUES ${valueClauses.join(',')}
          ON CONFLICT (${conflictTarget}) DO UPDATE SET ${updateSet}`;
        await client.query(sql, params);
        merged += batch.length;
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return merged;
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

