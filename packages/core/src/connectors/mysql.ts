// @ts-nocheck
import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('mysql')
export class MySQLConnector extends BaseConnector {
  private pool: Pool | null = null;
  private cdcActive = false;
  private cdcInterval: ReturnType<typeof setInterval> | null = null;

  async connect(config?: DatabaseConfig): Promise<void> {
    return this.withRetry(async () => {
      try {
        if (config) this.config = config;
        const cfg = this.config;
        this.pool = mysql.createPool({
          host: cfg.host,
          port: cfg.port || 3306,
          database: cfg.database,
          user: cfg.username,
          password: cfg.password,
          ssl: cfg.ssl ? { rejectUnauthorized: false } : undefined,
          connectionLimit: 10,
          waitForConnections: true,
        });
        const conn = await this.pool.getConnection();
        await conn.query('SELECT 1');
        conn.release();
        this.connected = true;
      } catch (error) {
        throw new Error(`MySQL connection failed: ${(error as Error).message}`);
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
      throw new Error(`MySQL disconnect failed: ${(error as Error).message}`);
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.pool) throw new Error('Not connected');
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async getClient(): Promise<any> {
    if (!this.pool) throw new Error('Not connected');
    return this.pool.getConnection();
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const conn = await this.pool.getConnection();
      try {
        await conn.query('SELECT 1');
        return true;
      } finally {
        conn.release();
      }
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.pool) throw new Error('Not connected');
    try {
      const [rows] = await this.pool.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = ? AND table_type = 'BASE TABLE' ORDER BY table_name`,
        [this.config.database]
      );
      return (rows as any[]).map((r) => r.table_name || r.TABLE_NAME);
    } catch (error) {
      throw new Error(`Failed to list tables: ${(error as Error).message}`);
    }
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.pool) throw new Error('Not connected');
    try {
      const [cols] = await this.pool.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = ? AND table_name = ? ORDER BY ordinal_position`,
        [this.config.database, table]
      );
      const [pks] = await this.pool.query(
        `SELECT column_name FROM information_schema.key_column_usage
         WHERE table_schema = ? AND table_name = ? AND constraint_name = 'PRIMARY'
         ORDER BY ordinal_position`,
        [this.config.database, table]
      );
      const pkSet = new Set((pks as any[]).map((r: any) => r.column_name || r.COLUMN_NAME));
      return {
        name: table,
        table,
        columns: (cols as any[]).map((c: any) => ({
          name: c.column_name || c.COLUMN_NAME,
          type: c.data_type || c.DATA_TYPE,
          nullable: (c.is_nullable || c.IS_NULLABLE) === 'YES',
          defaultValue: c.column_default || c.COLUMN_DEFAULT,
          primaryKey: pkSet.has(c.column_name || c.COLUMN_NAME),
        })),
        primaryKey: (pks as any[]).map((r: any) => r.column_name || r.COLUMN_NAME),
        primaryKeys: (pks as any[]).map((r: any) => r.column_name || r.COLUMN_NAME),
      };
    } catch (error) {
      throw new Error(`Failed to get schema for ${table}: ${(error as Error).message}`);
    }
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.pool) throw new Error('Not connected');
    this.cdcActive = true;

    // Poll-based CDC using updated_at or timestamp columns
    // For true binlog CDC, MySQL requires binlog access which needs server config
    // This polling approach works with any MySQL setup
    const tables = await this.getTables();
    const watermarks: Record<string, string | null> = {};
    for (const table of tables) {
      watermarks[table] = null;
    }

    this.cdcInterval = setInterval(async () => {
      if (!this.cdcActive || !this.pool) return;
      try {
        for (const table of tables) {
          // Try to find a watermark column
          const schema = await this.getTableSchema(table);
          const wmCol = schema.columns.find((c: any) =>
            ['updated_at', 'updatedAt', 'modified_at', 'modifiedAt', 'created_at', 'createdAt'].includes(c.name)
          )?.name;

          if (!wmCol) continue;

          const watermark = watermarks[table];
          const q = watermark
            ? `SELECT * FROM ${table} WHERE ${wmCol} > ? ORDER BY ${wmCol} LIMIT ${this.batchSize}`
            : `SELECT * FROM ${table} ORDER BY ${wmCol} DESC LIMIT ${this.batchSize}`;
          const p = watermark ? [watermark] : [];
          const [rows] = await this.pool.query(q, p);

          for (const row of rows as any[]) {
            const op = watermark ? 'I' : 'S';
            callback({
              op,
              table,
              before: null,
              after: row,
              ts: new Date(),
            });
            watermarks[table] = row[wmCol]?.toString() || watermarks[table];
          }
        }
      } catch {
        // Retry on next interval
      }
    }, 5000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcInterval) {
      clearInterval(this.cdcInterval);
      this.cdcInterval = null;
    }
  }

  async extractFull(table: string, opts?: { limit?: number; offset?: number }): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const limit = opts?.limit || this.batchSize;
    const offset = opts?.offset || 0;
    const events: UnifiedChangeEvent[] = [];
    const [rows] = await this.pool.query(`SELECT * FROM ${table} LIMIT ? OFFSET ?`, [limit, offset]);
    for (const row of rows as any[]) {
      events.push(createEvent({
        op: 'S',
        table,
        after: row,
        before: null,
        sourceMetadata: { source: 'mysql' },
      }));
    }
    return events;
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const wmCol = opts?.watermarkColumn || this.config.watermarkColumn || 'updated_at';
    const watermark = opts?.watermarkValue || null;
    const events: UnifiedChangeEvent[] = [];

    const q = watermark
      ? `SELECT * FROM ${table} WHERE ${wmCol} > ? ORDER BY ${wmCol} LIMIT ?`
      : `SELECT * FROM ${table} ORDER BY ${wmCol} LIMIT ?`;
    const p = watermark ? [watermark, this.batchSize] : [this.batchSize];
    const [rows] = await this.pool.query(q, p);

    for (const row of rows as any[]) {
      events.push(createEvent({
        op: 'I',
        table,
        after: row,
        before: null,
        sourceMetadata: { source: 'mysql', pk: row[wmCol]?.toString() || null },
      }));
    }
    return events;
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.pool) throw new Error('Not connected');
    const [rows] = await this.pool.query(`SELECT COUNT(*) AS cnt FROM ${table}`);
    return (rows as any[])[0]?.cnt || 0;
  }

  async getPrimaryKey(): Promise<string> {
    return 'id';
  }
}
