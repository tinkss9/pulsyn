// @ts-nocheck
import duckdb from 'duckdb';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('duckdb')
export class DuckDBConnector extends BaseConnector {
  private db: duckdb.Database | null = null;
  private conn: duckdb.Connection | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const dbPath = config.host || config.database || ':memory:';
      this.db = await new Promise<duckdb.Database>((resolve, reject) => {
        const db = new duckdb.Database(dbPath, (err) => {
          if (err) reject(err); else resolve(db);
        });
      });
      this.conn = await new Promise<duckdb.Connection>((resolve, reject) => {
        const conn = this.db!.connect((err) => {
          if (err) reject(err); else resolve(conn);
        });
      });
      await this.executeQuery('SELECT 1');
      this.connected = true;
    } catch (error) {
      throw new Error(`DuckDB connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.db) {
      await new Promise<void>((resolve) => {
        this.db!.close(() => resolve());
      });
      this.db = null;
    }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.conn) return false;
      const rows = await this.executeQuery('SELECT 1 AS ok');
      return rows[0]?.ok === 1;
    } catch {
      return false;
    }
  }

  private executeQuery(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.conn) return reject(new Error('Not connected'));
      if (params.length > 0) {
        this.conn.all(sql, ...params, (err: Error | null, rows: any[]) => {
          if (err) reject(err); else resolve(rows || []);
        });
      } else {
        this.conn.all(sql, (err: Error | null, rows: any[]) => {
          if (err) reject(err); else resolve(rows || []);
        });
      }
    });
  }

  async getTables(): Promise<string[]> {
    if (!this.conn) throw new Error('Not connected');
    const rows = await this.executeQuery(
      `SELECT schema_name || '.' || table_name AS full_name
       FROM information_schema.tables
       WHERE table_type = 'BASE TABLE' AND table_schema != 'information_schema'
       ORDER BY full_name`
    );
    return rows.map((r) => r.full_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.conn) throw new Error('Not connected');
    const [schema, tableName] = table.includes('.') ? table.split('.') : ['main', table];
    const cols = await this.executeQuery(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = ? AND table_name = ?
       ORDER BY ordinal_position`,
      [schema, tableName]
    );
    // DuckDB doesn't have traditional PKs in info schema, infer from constraints
    const pks = await this.executeQuery(
      `SELECT column_name FROM duckdb_constraints()
       WHERE table_name = ? AND constraint_type = 'PRIMARY KEY'`,
      [tableName]
    ).catch(() => []);

    return {
      table,
      columns: cols.map((c) => ({
        name: c.column_name, type: c.data_type,
        nullable: c.is_nullable === 'YES', defaultValue: c.column_default,
      })),
      primaryKeys: pks.map((r: any) => r.column_name),
    };
  }

  async startCDC(_callback: (event: CDCEvent) => void): Promise<void> {
    // DuckDB is an analytical engine — no CDC support
    throw new Error('DuckDB does not support CDC. Use extractFull for snapshots.');
  }

  async stopCDC(): Promise<void> {
    // No-op
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.conn) throw new Error('Not connected');
    const events: UnifiedChangeEvent[] = [];
    let offset = 0;

    while (true) {
      const rows = await this.executeQuery(
        `SELECT * FROM ${table} LIMIT ? OFFSET ?`,
        [this.batchSize, offset]
      );
      if (rows.length === 0) break;
      for (const row of rows) {
        events.push(createEvent('S', table, row, null, null, { source: 'duckdb' }));
      }
      offset += rows.length;
      if (rows.length < this.batchSize) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.conn) throw new Error('Not connected');
    const wmCol = this.config.watermarkColumn || 'updated_at';
    const events: UnifiedChangeEvent[] = [];
    const query = watermark
      ? `SELECT * FROM ${table} WHERE ${wmCol} > ? ORDER BY ${wmCol} LIMIT ?`
      : `SELECT * FROM ${table} ORDER BY ${wmCol} LIMIT ?`;
    const params = watermark ? [watermark, this.batchSize] : [this.batchSize];
    const rows = await this.executeQuery(query, params);
    for (const row of rows) {
      events.push(createEvent('I', table, row, null, row[wmCol]?.toString() || null, { source: 'duckdb' }));
    }
    return events;
  }

  /** Export table to Parquet file */
  async exportToParquet(table: string, outputPath: string): Promise<void> {
    if (!this.conn) throw new Error('Not connected');
    await this.executeQuery(`COPY ${table} TO '${outputPath}' (FORMAT PARQUET, COMPRESSION ZSTD)`);
  }

  /** Import from Parquet file */
  async importFromParquet(filePath: string, table: string): Promise<void> {
    if (!this.conn) throw new Error('Not connected');
    await this.executeQuery(`CREATE TABLE IF NOT EXISTS ${table} AS SELECT * FROM read_parquet('${filePath}')`);
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.conn) throw new Error('Not connected');
    const rows = await this.executeQuery(`SELECT COUNT(*) AS cnt FROM ${table}`);
    return Number(rows[0]?.cnt || 0);
  }

  async getPrimaryKey(table: string): Promise<string> {
    const schema = await this.getTableSchema(table);
    return schema.primaryKeys[0] || 'rowid';
  }
}

