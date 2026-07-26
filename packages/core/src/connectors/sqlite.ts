// @ts-nocheck
import Database from 'better-sqlite3';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('sqlite')
export class SQLiteConnector extends BaseConnector {
  private db: Database.Database | null = null;
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const dbPath = config.host || config.database || ':memory:';
      this.db = new Database(dbPath, {
        readonly: (config as any).readonly || false,
        fileMustExist: (config as any).fileMustExist !== false,
      });
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('busy_timeout = 5000');
      this.connected = true;
    } catch (error) {
      throw new Error(`SQLite connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.db) return false;
      const row = this.db.prepare('SELECT 1 AS ok').get() as any;
      return row?.ok === 1;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.db) throw new Error('Not connected');
    const rows = this.db.prepare(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    ).all() as any[];
    return rows.map((r) => r.name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.db) throw new Error('Not connected');
    const cols = this.db.prepare(`PRAGMA table_info('${table}')`).all() as any[];
    const columns = cols.map((c) => ({
      name: c.name,
      type: c.type || 'TEXT',
      nullable: c.notnull === 0,
      defaultValue: c.dflt_value,
    }));
    const primaryKeys = cols.filter((c) => c.pk > 0).map((c) => c.name);
    return { table, columns, primaryKeys };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    // SQLite has no native CDC — snapshot-only source
    throw new Error('SQLite does not support CDC. Use extractFull for snapshots.');
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.db) throw new Error('Not connected');
    const schema = await this.getTableSchema(table);
    const pk = schema.primaryKeys[0] || 'rowid';
    const events: UnifiedChangeEvent[] = [];
    let lastKey: any = null;

    while (true) {
      let rows: any[];
      if (lastKey) {
        rows = this.db.prepare(
          `SELECT * FROM "${table}" WHERE "${pk}" > ? ORDER BY "${pk}" LIMIT ?`
        ).all(lastKey, this.batchSize) as any[];
      } else {
        rows = this.db.prepare(
          `SELECT * FROM "${table}" ORDER BY "${pk}" LIMIT ?`
        ).all(this.batchSize) as any[];
      }
      if (rows.length === 0) break;
      for (const row of rows) {
        events.push(createEvent('S', table, row, null, row[pk]?.toString() || null, { source: 'sqlite' }));
      }
      lastKey = rows[rows.length - 1][pk];
      if (rows.length < this.batchSize) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.db) throw new Error('Not connected');
    const wmCol = this.config.watermarkColumn || 'updated_at';
    const events: UnifiedChangeEvent[] = [];
    let rows: any[];

    if (watermark) {
      rows = this.db.prepare(
        `SELECT * FROM "${table}" WHERE "${wmCol}" > ? ORDER BY "${wmCol}" LIMIT ?`
      ).all(watermark, this.batchSize) as any[];
    } else {
      rows = this.db.prepare(
        `SELECT * FROM "${table}" ORDER BY "${wmCol}" LIMIT ?`
      ).all(this.batchSize) as any[];
    }
    for (const row of rows) {
      events.push(createEvent('I', table, row, null, row[wmCol]?.toString() || null, { source: 'sqlite' }));
    }
    return events;
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.db) throw new Error('Not connected');
    const row = this.db.prepare(`SELECT COUNT(*) AS cnt FROM "${table}"`).get() as any;
    return row?.cnt || 0;
  }

  async getPrimaryKey(table: string): Promise<string> {
    const schema = await this.getTableSchema(table);
    return schema.primaryKeys[0] || 'rowid';
  }
}

