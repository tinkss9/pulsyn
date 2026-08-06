// Databricks Connector — Real API Integration
// Auth: Personal Access Token or OAuth2
// API: Databricks SQL API + Unity Catalog
// Test: Free Databricks Community Edition

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('databricks-real')
export class DatabricksRealConnector extends BaseConnector {
  private host = '';
  private token = '';
  private catalog = 'hive_metastore';
  private schema = 'default';
  private warehouseId = '';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.host = config.host || '';
    this.token = config.token || config.password || '';
    this.catalog = config.database || 'hive_metastore';
    this.schema = config.schema || 'default';
    this.warehouseId = config.warehouse || '';
    if (!this.host || !this.token) throw new Error('Databricks host and token required');

    const resp = await this.sqlQuery('SELECT 1');
    if (!resp) throw new Error('Databricks connection failed');
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; this.token = ''; }
  async testConnection(): Promise<boolean> { try { return !!(await this.sqlQuery('SELECT 1')); } catch { return false; } }

  async getTables(): Promise<string[]> {
    const rows = await this.sqlQuery(`SHOW TABLES IN ${this.catalog}.${this.schema}`);
    return (rows || []).map((r: any) => r.tableName || Object.values(r)[1]);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const rows = await this.sqlQuery(`DESCRIBE TABLE ${this.catalog}.${this.schema}.${table}`);
    return {
      table,
      columns: (rows || []).map((r: any) => ({
        name: r.col_name || Object.values(r)[0],
        type: this.mapType(r.data_type || Object.values(r)[1]),
        nullable: true,
        primaryKey: false,
      })),
      primaryKeys: [],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const rows = await this.sqlQuery(`SELECT * FROM ${this.catalog}.${this.schema}.${table} LIMIT 1000`);
    return (rows || []).map((row: any) => createEvent({ op: 'S', table, after: row, watermark: null }));
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    let sql = `SELECT * FROM ${this.catalog}.${this.schema}.${table}`;
    if (opts?.watermarkColumn && opts?.watermarkValue) sql += ` WHERE ${opts.watermarkColumn} > '${opts.watermarkValue}'`;
    sql += ' LIMIT 1000';
    const rows = await this.sqlQuery(sql);
    return (rows || []).map((row: any) => createEvent({ op: 'S', table, after: row, watermark: opts?.watermarkColumn ? row[opts.watermarkColumn] : null }));
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> { this.cdcActive = true; }
  async stopCDC(): Promise<void> { this.cdcActive = false; }

  async sqlQuery(sql: string): Promise<any[]> {
    const resp = await fetch(`${this.host}/api/2.0/sql/statements`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ statement: sql, warehouse_id: this.warehouseId, catalog: this.catalog, schema: this.schema }),
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    const cols = (data.manifest?.schema?.columns || []).map((c: any) => c.name);
    return (data.result?.data_array || []).map((row: any[]) => {
      const obj: Record<string, any> = {};
      cols.forEach((c: string, i: number) => { obj[c] = row[i]; });
      return obj;
    });
  }

  private mapType(dbType: string): string {
    const map: Record<string, string> = { 'string': 'string', 'int': 'number', 'bigint': 'number', 'double': 'number', 'boolean': 'boolean', 'timestamp': 'string', 'date': 'string', 'array': 'json', 'struct': 'json', 'map': 'json' };
    return map[dbType.toLowerCase()] || 'string';
  }
}
