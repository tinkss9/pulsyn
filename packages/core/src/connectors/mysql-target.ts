// @ts-nocheck
import * as mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { BaseConnector } from './base';
import { registerTarget } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerTarget('mysql')
export class MySQLTargetConnector extends BaseConnector {
  private pool: mysql.Pool | null = null;

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 'mysql', config, options?.batchSize || 10000);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.pool = mysql.createPool({
      host: config.host || 'localhost',
      port: config.port || 3306,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? {} : undefined,
      connectionLimit: 20,
      enableKeepAlive: true,
      waitForConnections: true,
    });
    const conn = await this.pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
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
      const [rows] = await this.pool.query('SELECT 1 AS ok');
      return (rows as any[])[0]?.ok === 1;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.pool) throw new Error('Not connected');
    const [rows] = await this.pool.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME`
    );
    return (rows as any[]).map((r) => r.TABLE_NAME);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.pool) throw new Error('Not connected');
    const [cols] = await this.pool.query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION`, [table]
    );
    return {
      table,
      columns: (cols as any[]).map((c) => ({
        name: c.COLUMN_NAME, type: c.DATA_TYPE, nullable: c.IS_NULLABLE === 'YES', defaultValue: c.COLUMN_DEFAULT,
      })),
      primaryKeys: (cols as any[]).filter((c) => c.COLUMN_KEY === 'PRI').map((c) => c.COLUMN_NAME),
    };
  }

  async startCDC(_cb: (event: CDCEvent) => void): Promise<void> {
    throw new Error('MySQL target does not support CDC read');
  }
  async stopCDC(): Promise<void> {}

  async createTableIfNeeded(table: string, schema: Record<string, any>): Promise<void> {
    if (!this.pool) throw new Error('Not connected');
    const cols = Object.entries(schema)
      .map(([name, type]) => `\`${name}\` ${this.mapType(type)}`)
      .join(', ');
    await this.pool.query(`CREATE TABLE IF NOT EXISTS \`${table}\` (${cols})`);
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    if (!this.pool) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    const columns = Object.keys(rows[0]);
    let written = 0;

    for (let i = 0; i < rows.length; i += this.batchSize) {
      const batch = rows.slice(i, i + this.batchSize);
      const tmpFile = path.join(os.tmpdir(), `pulsyn_mysql_${this.id}_${Date.now()}.tsv`);

      try {
        // Write TSV for LOAD DATA LOCAL INFILE
        const lines = batch.map((row) =>
          columns.map((c) => {
            const v = row[c];
            if (v === null || v === undefined) return '\\N';
            if (v instanceof Date) return v.toISOString().replace('T', ' ').replace('Z', '');
            if (typeof v === 'object') return JSON.stringify(v).replace(/\t/g, ' ').replace(/\n/g, '\\n');
            return String(v).replace(/\t/g, ' ').replace(/\n/g, '\\n');
          }).join('\t')
        ).join('\n');
        fs.writeFileSync(tmpFile, lines);

        const conn = await this.pool!.getConnection();
        try {
          await conn.query({
            sql: `LOAD DATA LOCAL INFILE ? INTO TABLE \`${table}\` FIELDS TERMINATED BY '\\t' LINES TERMINATED BY '\\n' (${columns.map((c) => `\`${c}\``).join(',')})`,
            values: [tmpFile],
            infileStreamFactory: () => fs.createReadStream(tmpFile),
          } as any);
          written += batch.length;
        } finally {
          conn.release();
        }
      } finally {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      }
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

    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      for (let i = 0; i < rows.length; i += this.batchSize) {
        const batch = rows.slice(i, i + this.batchSize);
        const placeholderRow = `(${columns.map(() => '?').join(',')})`;
        const placeholders = batch.map(() => placeholderRow).join(',');
        const params: any[] = [];
        for (const row of batch) {
          columns.forEach((c) => params.push(row[c] ?? null));
        }

        const updateClause = nonKeyCols.map((c) => `\`${c}\`=VALUES(\`${c}\`)`).join(', ');
        const sql = `INSERT INTO \`${table}\` (${columns.map((c) => `\`${c}\``).join(',')}) VALUES ${placeholders}
          ON DUPLICATE KEY UPDATE ${updateClause}`;
        await conn.query(sql, params);
        merged += batch.length;
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
    return merged;
  }

  private mapType(type: any): string {
    const t = typeof type === 'string' ? type.toLowerCase() : String(type).toLowerCase();
    if (t.includes('int')) return 'BIGINT';
    if (t.includes('float') || t.includes('double')) return 'DOUBLE';
    if (t.includes('decimal') || t.includes('numeric')) return 'DECIMAL(18,4)';
    if (t.includes('bool')) return 'TINYINT(1)';
    if (t.includes('date') && !t.includes('time')) return 'DATE';
    if (t.includes('time')) return 'DATETIME(6)';
    if (t.includes('json')) return 'JSON';
    if (t.includes('text') || t.includes('clob')) return 'LONGTEXT';
    return 'VARCHAR(255)';
  }
}

