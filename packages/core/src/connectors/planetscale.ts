// @ts-nocheck
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('planetscale')
export class PlanetScaleConnector extends BaseConnector {
  private pool: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'planetscale', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    const mysql = require('mysql2/promise');
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port || 3306,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: { rejectUnauthorized: true }
    });
    await this.pool.query('SELECT 1');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.pool) await this.pool.end();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const [rows] = await this.pool.query('SHOW TABLES');
    return rows.map((r: any) => Object.values(r)[0] as string);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const [cols] = await this.pool.query('DESCRIBE ??', [table]);
    return {
      name: table,
      columns: (cols as any[]).map(c => ({ name: c.Field, type: c.Type, nullable: c.Null === 'YES' })),
      primaryKey: (cols as any[]).filter(c => c.Key === 'PRI').map(c => c.Field)
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const [rows] = await this.pool.query('SELECT * FROM ?? LIMIT ?', [table, this.batchSize]);
    return (rows as any[]).map(row => createEvent({ op: 'S', table, data: row, watermark: row.id || '' }));
  }

  async startCDC(): Promise<void> { throw new Error('PlanetScale CDC requires VStream — use polling'); }
  async stopCDC(): Promise<void> {}
}
