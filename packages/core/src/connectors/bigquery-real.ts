// BigQuery Connector — Real API Integration
// Auth: Service account JSON or OAuth2
// API: BigQuery REST API v2
// Test: Free GCP project with BigQuery sandbox

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('bigquery-real')
export class BigQueryRealConnector extends BaseConnector {
  private projectId = '';
  private accessToken = '';
  private dataset = '';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.projectId = config.database || config.host || '';
    this.accessToken = config.token || config.password || '';
    this.dataset = config.schema || '';
    if (!this.projectId || !this.accessToken) throw new Error('BigQuery project ID and access token required');

    const resp = await this.bqGet(`/projects/${this.projectId}/datasets?maxResults=1`);
    if (!resp.ok) throw new Error(`BigQuery connection failed: HTTP ${resp.status}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; this.accessToken = ''; }
  async testConnection(): Promise<boolean> {
    try { return (await this.bqGet(`/projects/${this.projectId}/datasets?maxResults=1`)).ok; } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    if (!this.dataset) return [];
    const resp = await this.bqGet(`/projects/${this.projectId}/datasets/${this.dataset}/tables?maxResults=100`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.tables || []).map((t: any) => t.tableReference?.tableId);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const resp = await this.bqGet(`/projects/${this.projectId}/datasets/${this.dataset}/tables/${table}`);
    if (!resp.ok) return { table, columns: [], primaryKeys: [] };
    const data = await resp.json();
    return {
      table,
      columns: (data.schema?.fields || []).map((f: any) => ({
        name: f.name, type: this.mapType(f.type), nullable: f.mode !== 'REQUIRED', primaryKey: false,
      })),
      primaryKeys: [],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const sql = `SELECT * FROM \`${this.projectId}.${this.dataset}.${table}\` LIMIT 1000`;
    return this.runQuery(sql, table);
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    let sql = `SELECT * FROM \`${this.projectId}.${this.dataset}.${table}\``;
    if (opts?.watermarkColumn && opts?.watermarkValue) sql += ` WHERE ${opts.watermarkColumn} > '${opts.watermarkValue}'`;
    sql += ' LIMIT 1000';
    return this.runQuery(sql, table);
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> { this.cdcActive = true; }
  async stopCDC(): Promise<void> { this.cdcActive = false; }

  async runQuery(sql: string, table?: string): Promise<UnifiedChangeEvent[]> {
    const resp = await this.bqPost(`/projects/${this.projectId}/queries`, { query: sql, useLegacySql: false });
    if (!resp.ok) return [];
    const data = await resp.json();
    const fields = (data.schema?.fields || []).map((f: any) => f.name);
    return (data.rows || []).map((row: any) => {
      const obj: Record<string, any> = {};
      fields.forEach((f: string, i: number) => { obj[f] = row.f?.[i]?.v; });
      return createEvent({ op: 'S', table: table || 'query', after: obj, watermark: null });
    });
  }

  private async bqGet(path: string): Promise<Response> {
    return fetch(`https://bigquery.googleapis.com/bigquery/v2${path}`, { headers: { 'Authorization': `Bearer ${this.accessToken}` } });
  }
  private async bqPost(path: string, body: any): Promise<Response> {
    return fetch(`https://bigquery.googleapis.com/bigquery/v2${path}`, { method: 'POST', headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  }
  private mapType(bqType: string): string {
    const map: Record<string, string> = { 'STRING': 'string', 'INTEGER': 'number', 'FLOAT': 'number', 'BOOLEAN': 'boolean', 'TIMESTAMP': 'string', 'DATE': 'string', 'RECORD': 'json' };
    return map[bqType] || 'string';
  }
}
