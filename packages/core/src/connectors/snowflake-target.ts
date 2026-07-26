// @ts-nocheck
import * as snowflake from 'snowflake-sdk';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { BaseConnector } from './base';
import { registerTarget } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerTarget('snowflake')
export class SnowflakeTargetConnector extends BaseConnector {
  private connection: snowflake.Connection | null = null;
  private stageName = '@~'; // user stage by default

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 'snowflake', config, options?.batchSize || 10000);
    if (options?.stageName) this.stageName = options.stageName;
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    return new Promise((resolve, reject) => {
      this.connection = snowflake.createConnection({
        account: config.host || '',
        username: config.username || '',
        password: config.password || '',
        database: config.database || '',
        schema: (config as any).schema || 'PUBLIC',
        warehouse: (config as any).warehouse || 'COMPUTE_WH',
        role: (config as any).role || undefined,
      });
      this.connection.connect((err) => {
        if (err) return reject(new Error(`Snowflake connect failed: ${err.message}`));
        this.connected = true;
        resolve();
      });
    });
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;
    return new Promise((resolve) => {
      this.connection!.destroy((err) => {
        this.connection = null;
        this.connected = false;
        resolve();
      });
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.execute('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    const rows = await this.execute('SHOW TABLES');
    return rows.map((r: any) => `${r.schema_name}.${r.name}`);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const rows = await this.execute(`DESCRIBE TABLE ${table}`);
    return {
      table,
      columns: rows.map((r: any) => ({
        name: r.name, type: r.type, nullable: r.null === 'Y', defaultValue: r.default,
      })),
      primaryKeys: rows.filter((r: any) => r.primary_key === 'Y').map((r: any) => r.name),
    };
  }

  async startCDC(_cb: (event: CDCEvent) => void): Promise<void> {
    throw new Error('Snowflake target does not support CDC read');
  }

  async stopCDC(): Promise<void> {}

  async createTableIfNeeded(table: string, schema: Record<string, any>): Promise<void> {
    const cols = Object.entries(schema)
      .map(([name, type]) => `"${name}" ${this.mapType(type)}`)
      .join(', ');
    await this.execute(`CREATE TABLE IF NOT EXISTS ${table} (${cols})`);
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    if (!this.connection) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    let written = 0;
    for (let i = 0; i < rows.length; i += this.batchSize) {
      const batch = rows.slice(i, i + this.batchSize);
      const tmpFile = path.join(os.tmpdir(), `pulsyn_sf_${this.id}_${Date.now()}.json`);
      try {
        const ndjson = batch.map((r) => JSON.stringify(r)).join('\n');
        fs.writeFileSync(tmpFile, ndjson);

        await this.execute(`PUT file://${tmpFile.replace(/\\/g, '/')} ${this.stageName} AUTO_COMPRESS=TRUE OVERWRITE=TRUE`);
        const fileName = path.basename(tmpFile);
        await this.execute(
          `COPY INTO ${table} FROM ${this.stageName}/${fileName}.gz ` +
          `FILE_FORMAT=(TYPE=JSON STRIP_OUTER_ARRAY=FALSE) ` +
          `MATCH_BY_COLUMN_NAME=CASE_INSENSITIVE PURGE=TRUE`
        );
        written += batch.length;
      } finally {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      }
    }
    return written;
  }

  async merge(table: string, events: UnifiedChangeEvent[], keyColumns: string[]): Promise<number> {
    if (!this.connection) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    const allCols = Object.keys(rows[0]);
    const nonKeyCols = allCols.filter((c) => !keyColumns.includes(c));
    const tempTable = `PULSYN_MERGE_${table.replace(/\./g, '_')}_${Date.now()}`;

    try {
      // Create temp table and load data
      await this.execute(`CREATE TEMPORARY TABLE ${tempTable} LIKE ${table}`);
      const tmpFile = path.join(os.tmpdir(), `pulsyn_sf_merge_${this.id}_${Date.now()}.json`);
      const ndjson = rows.map((r) => JSON.stringify(r)).join('\n');
      fs.writeFileSync(tmpFile, ndjson);

      await this.execute(`PUT file://${tmpFile.replace(/\\/g, '/')} ${this.stageName} AUTO_COMPRESS=TRUE OVERWRITE=TRUE`);
      const fileName = path.basename(tmpFile);
      await this.execute(
        `COPY INTO ${tempTable} FROM ${this.stageName}/${fileName}.gz ` +
        `FILE_FORMAT=(TYPE=JSON STRIP_OUTER_ARRAY=FALSE) ` +
        `MATCH_BY_COLUMN_NAME=CASE_INSENSITIVE PURGE=TRUE`
      );
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

      // MERGE from temp into target
      const onClause = keyColumns.map((k) => `tgt."${k}" = src."${k}"`).join(' AND ');
      const updateSet = nonKeyCols.map((c) => `tgt."${c}" = src."${c}"`).join(', ');
      const insertCols = allCols.map((c) => `"${c}"`).join(', ');
      const insertVals = allCols.map((c) => `src."${c}"`).join(', ');

      await this.execute(
        `MERGE INTO ${table} AS tgt USING ${tempTable} AS src ON ${onClause} ` +
        `WHEN MATCHED THEN UPDATE SET ${updateSet} ` +
        `WHEN NOT MATCHED THEN INSERT (${insertCols}) VALUES (${insertVals})`
      );
      return rows.length;
    } finally {
      try { await this.execute(`DROP TABLE IF EXISTS ${tempTable}`); } catch { /* cleanup */ }
    }
  }

  private execute(sql: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.connection!.execute({
        sqlText: sql,
        complete: (err, _stmt, rows) => {
          if (err) return reject(new Error(`Snowflake SQL error: ${err.message}`));
          resolve(rows || []);
        },
      });
    });
  }

  private mapType(type: any): string {
    const t = typeof type === 'string' ? type.toLowerCase() : String(type).toLowerCase();
    if (t.includes('int')) return 'NUMBER';
    if (t.includes('float') || t.includes('double') || t.includes('decimal')) return 'FLOAT';
    if (t.includes('bool')) return 'BOOLEAN';
    if (t.includes('date') && !t.includes('time')) return 'DATE';
    if (t.includes('time')) return 'TIMESTAMP_NTZ';
    return 'VARCHAR';
  }
}

