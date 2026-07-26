// @ts-nocheck
// StarRocks v2 Connector — Pulsyn CDC Platform
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('starrocks-v2')
export class StarrocksV2Connector extends BaseConnector {
  private pool: any = null;
  private client: any = null;
  private db: any = null;
  private apiKey: string = '';
  private baseUrl: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'starrocks-v2', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    const mysql = require('mysql2/promise'); this.pool = mysql.createPool({ host: config.host, port: config.port || 3306, database: config.database, user: config.user, password: config.password }); await this.pool.query('SELECT 1');
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
      await this.pool.query('SELECT 1'); return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const [rows] = await this.pool.query('SHOW TABLES'); return rows.map(r => Object.values(r)[0]);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const [cols] = await this.pool.query('DESCRIBE ' + table); return { name: table, columns: cols.map(c => ({ name: c.Field, type: c.Type, nullable: c.Null === 'YES' })), primaryKey: cols.filter(c => c.Key === 'PRI').map(c => c.Field) };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const [rows] = await this.pool.query('SELECT * FROM ' + table + ' LIMIT ?', [this.batchSize]); return rows.map(row => createEvent({ op: 'S', table, data: row, watermark: row.id || '' }));
  }

  async startCDC(): Promise<void> { throw new Error('CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}
