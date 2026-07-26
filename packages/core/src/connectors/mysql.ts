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

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const [rows] = await this.pool.query('SELECT 1 AS ok');
      return (rows as any[])[0]?.ok === 1;
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
        `SELECT column_name, data_type, is_nullable, column_default, column_key
         FROM information_schema.columns
         WHERE table_schema = ? AND table_name = ? ORDER BY ordinal_position`,
        [this.config.database, table]
      );
      const columns = (cols as any[]).map((c) => ({
        name: c.column_name || c.COLUMN_NAME,
        type: c.data_type || c.DATA_TYPE,
        nullable: (c.is_nullable || c.IS_NULLABLE) === 'YES',
        defaultValue: c.column_default || c.COLUMN_DEFAULT,
      }));
      const primaryKeys = (cols as any[])
        .filter((c) => (c.column_key || c.COLUMN_KEY) === 'PRI')
        .map((c) => c.column_name || c.COLUMN_NAME);
      return { table, columns, primaryKeys };
    } catch (error) {
      throw new Error(`Failed to get schema for ${table}: ${(error as Error).message}`);
    }
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.pool) throw new Error('Not connected');
    try {
      const [statusRows] = await this.pool.query('SHOW MASTER STATUS');
      const status = (statusRows as any[])[0];
      if (!status) throw new Error('Binary logging not enabled');
      this.cdcActive = true;
      this.pollBinlog(status.File, status.Position, callback);
    } catch (error) {
      throw new Error(`Failed to start CDC: ${(error as Error).message}`);
    }
  }

  private async pollBinlog(file: string, pos: number, cb: (event: CDCEvent) => void): Promise<void> {
    while (this.cdcActive && this.pool) {
      try {
        const [events] = await this.pool.query(
          `SHOW BINLOG EVENTS IN ? FROM ? LIMIT ?`, [file, pos, this.batchSize]
        );
        for (const evt of events as any[]) {
          if (['Write_rows', 'Update_rows', 'Delete_rows'].includes(evt.Event_type)) {
            const op = evt.Event_type === 'Write_rows' ? 'I'
              : evt.Event_type === 'Update_rows' ? 'U' : 'D';
            cb({
              op, table: evt.Info?.split(' ')[0] || 'unknown',
              before: op !== 'I' ? {} : null,
              after: op !== 'D' ? {} : null,
              ts: new Date(),
            });
          }
          pos = evt.End_log_pos || pos;
        }
        await new Promise((r) => setTimeout(r, 1000));
      } catch {
        if (this.cdcActive) await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const schema = await this.getTableSchema(table);
    const pk = schema.primaryKeys[0] || 'id';
    const events: UnifiedChangeEvent[] = [];
    let lastKey: any = null;

    while (true) {
      const q = lastKey
        ? `SELECT * FROM \`${table}\` WHERE \`${pk}\` > ? ORDER BY \`${pk}\` LIMIT ?`
        : `SELECT * FROM \`${table}\` ORDER BY \`${pk}\` LIMIT ?`;
      const p = lastKey ? [lastKey, this.batchSize] : [this.batchSize];
      const [rows] = await this.pool.query(q, p);
      const data = rows as any[];
      if (data.length === 0) break;
      for (const row of data) {
        events.push(createEvent('S', table, row, null, row[pk]?.toString() || null, { source: 'mysql' }));
      }
      lastKey = data[data.length - 1][pk];
      if (data.length < this.batchSize) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');
    const wmCol = this.config.watermarkColumn || 'updated_at';
    const events: UnifiedChangeEvent[] = [];
    const q = watermark
      ? `SELECT * FROM \`${table}\` WHERE \`${wmCol}\` > ? ORDER BY \`${wmCol}\` LIMIT ?`
      : `SELECT * FROM \`${table}\` ORDER BY \`${wmCol}\` LIMIT ?`;
    const p = watermark ? [watermark, this.batchSize] : [this.batchSize];
    const [rows] = await this.pool.query(q, p);
    for (const row of rows as any[]) {
      events.push(createEvent('I', table, row, null, row[wmCol]?.toString() || null, { source: 'mysql' }));
    }
    return events;
  }
}

