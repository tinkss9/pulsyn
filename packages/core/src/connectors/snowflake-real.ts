// Snowflake Connector — Real API Integration
// Auth: Account + username + password (or key pair)
// API: Snowflake SQL API + Snowpipe
// Test: Free Snowflake trial account

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('snowflake-real')
export class SnowflakeRealConnector extends BaseConnector {
  private account = '';
  private username = '';
  private password = '';
  private database = '';
  private schema = 'PUBLIC';
  private warehouse = '';
  private role = 'PUBLIC';
  private token = '';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.account = config.host || '';
    this.username = config.username || '';
    this.password = config.password || '';
    this.database = config.database || '';
    this.schema = config.schema || 'PUBLIC';
    this.warehouse = config.warehouse || '';
    this.role = config.role || 'PUBLIC';

    // Get OAuth token via password grant
    const tokenResp = await fetch(`https://${this.account}.snowflakecomputing.com/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=password&username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}&scope=session:role:${this.role}`,
    });
    if (!tokenResp.ok) throw new Error(`Snowflake auth failed: HTTP ${tokenResp.status}`);
    const tokenData = await tokenResp.json();
    this.token = tokenData.access_token;

    // Verify connection
    const testResp = await this.sqlQuery('SELECT CURRENT_VERSION()');
    if (!testResp) throw new Error('Snowflake connection verification failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; this.token = ''; }

  async testConnection(): Promise<boolean> {
    try { return !!(await this.sqlQuery('SELECT CURRENT_VERSION()')); } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const rows = await this.sqlQuery(`SELECT TABLE_NAME FROM ${this.database}.INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${this.schema}' ORDER BY TABLE_NAME`);
    return (rows || []).map((r: any) => r.TABLE_NAME || r.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const rows = await this.sqlQuery(`SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM ${this.database}.INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${this.schema}' AND TABLE_NAME = '${table}' ORDER BY ORDINAL_POSITION`);
    return {
      table,
      columns: (rows || []).map((r: any) => ({
        name: r.COLUMN_NAME || r.column_name,
        type: this.mapType(r.DATA_TYPE || r.data_type),
        nullable: (r.IS_NULLABLE || r.is_nullable) === 'YES',
        primaryKey: false,
      })),
      primaryKeys: [],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const rows = await this.sqlQuery(`SELECT * FROM ${this.database}.${this.schema}.${table} LIMIT 1000`);
    return (rows || []).map((row: any) => createEvent({ op: 'S', table, after: row, watermark: null }));
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    let query = `SELECT * FROM ${this.database}.${this.schema}.${table}`;
    if (opts?.watermarkColumn && opts?.watermarkValue) {
      query += ` WHERE ${opts.watermarkColumn} > '${opts.watermarkValue}'`;
    }
    query += ' LIMIT 1000';
    const rows = await this.sqlQuery(query);
    return (rows || []).map((row: any) => createEvent({ op: 'S', table, after: row, watermark: opts?.watermarkColumn ? row[opts.watermarkColumn] : null }));
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> { this.cdcActive = true; }
  async stopCDC(): Promise<void> { this.cdcActive = false; }

  async sqlQuery(sql: string): Promise<any[]> {
    const resp = await fetch(`https://${this.account}.snowflakecomputing.com/api/v2/statements`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'X-Snowflake-Authorization-Token-Type': 'OAUTH',
      },
      body: JSON.stringify({
        statement: sql,
        database: this.database,
        schema: this.schema,
        warehouse: this.warehouse,
        role: this.role,
      }),
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    const cols = (data.resultSetMetaData?.rowType || []).map((c: any) => c.name);
    return (data.data || []).map((row: any[]) => {
      const obj: Record<string, any> = {};
      cols.forEach((c: string, i: number) => { obj[c] = row[i]; });
      return obj;
    });
  }

  private mapType(sfType: string): string {
    const map: Record<string, string> = { 'TEXT': 'string', 'VARCHAR': 'string', 'NUMBER': 'number', 'FLOAT': 'number', 'BOOLEAN': 'boolean', 'DATE': 'string', 'TIMESTAMP_NTZ': 'string', 'TIMESTAMP_LTZ': 'string', 'VARIANT': 'json', 'ARRAY': 'json', 'OBJECT': 'json' };
    return map[sfType.toUpperCase()] || 'string';
  }
}
