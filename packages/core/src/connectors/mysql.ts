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
    throw new Error('MySQL CDC not yet implemented — use polling-based extractIncremental');
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
  }

  async extractFull(table: string, opts?: { limit?: number; offset?: number }): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const limit = opts?.limit || this.batchSize;
    const offset = opts?.offset || 0;
    const events: UnifiedChangeEvent[] = [];
    const [rows] = await this.pool.query(`SELECT * FROM ${table} LIMIT ? OFFSET ?`, [limit, offset]);
    for (const row of rows as any[]) {
      events.push(createEvent({
        op: 'S', table,
        after: row,
        before: null,
        sourceMetadata: { source: 'mysql' },
      }));
    }
    return events;
  }
}
