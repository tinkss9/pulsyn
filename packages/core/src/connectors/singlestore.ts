// SingleStore Connector — distributed SQL database source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let mysql: any;
try { mysql = require('mysql2/promise'); } catch {}

@registerSource('singlestore')
export class SingleStoreConnector extends BaseConnector {
  private pool: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'singlestore', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!mysql) throw new Error('mysql2 not installed');
    this.pool = mysql.createPool({
      host: config.host, port: config.port || 3306, database: config.database,
      user: config.user, password: config.password, ssl: config.ssl || false,
    });
    const conn = await this.pool.getConnection();
    await conn.ping();
    conn.release();
    this.connected = true;
  }

  async disconnect(): Promise<void> { if (this.pool) { await this.pool.end(); this.pool = null; } this.connected = false; }
  async testConnection(): Promise<boolean> {
    try { const c = await this.pool.getConnection(); await c.ping(); c.release(); return true; } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const [rows] = await this.pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name`);
    return (rows as any[]).map(r => r.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const [cols] = await this.pool.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? ORDER BY ordinal_position`, [table]);
    return {
      name: table,
      columns: (cols as any[]).map(c => ({ name: c.column_name, type: c.data_type, nullable: c.is_nullable === 'YES' })),
      primaryKey: [],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const [rows] = await this.pool.query(`SELECT * FROM \`${table}\` LIMIT ?`, [this.batchSize]);
    return (rows as any[]).map(row => createEvent({ op: 'S', table, after: row, watermark: row.id || '' }));
  }

  async startCDC(): Promise<void> { throw new Error('SingleStore CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}
