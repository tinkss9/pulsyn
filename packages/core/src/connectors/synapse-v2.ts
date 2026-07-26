// @ts-nocheck
// Synapse v2 Connector — Pulsyn CDC Platform
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('synapse-v2')
export class SynapseV2Connector extends BaseConnector {
  private pool: any = null;
  private client: any = null;
  private db: any = null;
  private apiKey: string = '';
  private baseUrl: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'synapse-v2', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    const mssql = require('mssql'); this.pool = await mssql.connect({ server: config.host, port: config.port || 1433, database: config.database, user: config.user, password: config.password, options: { encrypt: config.ssl || false, trustServerCertificate: true } });
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.pool) await this.pool.end?.();
    if (this.client) await this.client.shutdown?.();
    if (this.db) this.db.close?.();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.pool.request().query('SELECT 1'); return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const res = await this.pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"); return res.recordset.map(r => r.TABLE_NAME);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const res = await this.pool.request().query('SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ' + table); return { name: table, columns: res.recordset.map(c => ({ name: c.COLUMN_NAME, type: c.DATA_TYPE, nullable: c.IS_NULLABLE === 'YES' })), primaryKey: [] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await this.pool.request().query('SELECT TOP ' + this.batchSize + ' * FROM ' + table); return res.recordset.map(row => createEvent({ op: 'S', table, data: row, watermark: row.id || '' }));
  }

  async startCDC(): Promise<void> { throw new Error('CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}
