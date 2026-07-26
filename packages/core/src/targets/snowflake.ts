// Snowflake Target Connector — write-only for data warehouse loading
// npm install snowflake-sdk

import { BaseConnector } from '../connectors/base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent } from '../events';
import { registerTarget } from '../connectors/registry';

let snowflake: any;
try { snowflake = require('snowflake-sdk'); } catch {}

@registerTarget('snowflake')
export class SnowflakeTargetConnector extends BaseConnector {
  private conn: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'snowflake', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!snowflake) throw new Error('snowflake-sdk not installed');
    this.conn = snowflake.createConnection({
      account: config.host,
      username: config.user,
      password: config.password,
      database: config.database,
      schema: (config as any).schema || 'PUBLIC',
      warehouse: (config as any).warehouse,
    });
    await new Promise((resolve, reject) => {
      this.conn.connect((err: any) => err ? reject(err) : resolve(true));
    });
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.conn) { this.conn.destroy(); this.conn = null; }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.conn) return false;
      await this.execute('SELECT 1');
      return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const result = await this.execute(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = CURRENT_SCHEMA() ORDER BY TABLE_NAME`);
    return result.map((r: any) => r.TABLE_NAME);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const cols = await this.execute(`SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}' ORDER BY ORDINAL_POSITION`);
    return {
      name: table,
      columns: cols.map((r: any) => ({ name: r.COLUMN_NAME, type: r.DATA_TYPE, nullable: r.IS_NULLABLE === 'YES' })),
      primaryKey: [],
    };
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    let written = 0;
    for (const event of events) {
      if (event.op === 'I' || event.op === 'S') {
        const cols = Object.keys(event.after || {});
        const vals = cols.map(c => `'${String((event.after || {})[c]).replace(/'/g, "''")}'`);
        await this.execute(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${vals.join(',')})`);
        written++;
      } else if (event.op === 'U' && event.before) {
        const sets = Object.entries(event.after || {}).map(([k, v]) => `${k}='${String(v).replace(/'/g, "''")}'`);
        const wheres = Object.entries(event.before).map(([k, v]) => `${k}='${String(v).replace(/'/g, "''")}'`);
        await this.execute(`UPDATE ${table} SET ${sets.join(',')} WHERE ${wheres.join(' AND ')}`);
        written++;
      } else if (event.op === 'D' && event.before) {
        const wheres = Object.entries(event.before).map(([k, v]) => `${k}='${String(v).replace(/'/g, "''")}'`);
        await this.execute(`DELETE FROM ${table} WHERE ${wheres.join(' AND ')}`);
        written++;
      }
    }
    return written;
  }

  async merge(table: string, events: UnifiedChangeEvent[], keyColumns: string[]): Promise<number> {
    return this.writeBatch(table, events); // Simplified — real MERGE needs Snowflake SQL
  }

  async startCDC(): Promise<void> { throw new Error('Snowflake is a target-only connector'); }
  async stopCDC(): Promise<void> {}

  private async execute(sql: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.conn.execute({
        sqlText: sql,
        complete: (err: any, stmt: any, rows: any[]) => err ? reject(err) : resolve(rows || []),
      });
    });
  }
}
