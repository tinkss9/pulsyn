// MariaDB Connector — MySQL-compatible with binlog CDC
// Uses mysql2 driver (same as MySQL connector, different defaults)

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let mysql: any;
try { mysql = require('mysql2/promise'); } catch {}

@registerSource('mariadb')
export class MariaDBConnector extends BaseConnector {
  private pool: any = null;
  private running = false;
  private pollingTimer: NodeJS.Timeout | null = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'mariadb', config);
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

  async disconnect(): Promise<void> { await this.stopCDC(); if (this.pool) { await this.pool.end(); this.pool = null; } this.connected = false; }
  async testConnection(): Promise<boolean> { try { const c = await this.pool.getConnection(); await c.ping(); c.release(); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    const [rows] = await this.pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE' ORDER BY table_name`);
    return (rows as any[]).map(r => r.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const [cols] = await this.pool.query(`SELECT column_name, data_type, is_nullable, column_key FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? ORDER BY ordinal_position`, [table]);
    return {
      name: table,
      columns: (cols as any[]).map((r: any) => ({ name: r.column_name, type: r.data_type, nullable: r.is_nullable === 'YES' })),
      primaryKey: (cols as any[]).filter((r: any) => r.column_key === 'PRI').map((r: any) => r.column_name),
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const [rows] = await this.pool.query(`SELECT * FROM \`${table}\` ORDER BY id LIMIT ?`, [this.batchSize]);
    return (rows as any[]).map((r: any) => createEvent({ op: 'S', table, after: r, watermark: String(r.id || 0) }));
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const sql = watermark ? `SELECT * FROM \`${table}\` WHERE id > ? ORDER BY id LIMIT ?` : `SELECT * FROM \`${table}\` ORDER BY id LIMIT ?`;
    const params = watermark ? [watermark, this.batchSize] : [this.batchSize];
    const [rows] = await this.pool.query(sql, params);
    return (rows as any[]).map((r: any) => createEvent({ op: 'I', table, after: r, watermark: String(r.id || 0) }));
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.running = true;
    await this.setupTriggers();
    this.pollChanges(callback);
  }

  async stopCDC(): Promise<void> { this.running = false; if (this.pollingTimer) { clearInterval(this.pollingTimer); this.pollingTimer = null; } }

  private async setupTriggers(): Promise<void> {
    await this.pool.query(`CREATE TABLE IF NOT EXISTS _pulsyn_changes (id BIGINT AUTO_INCREMENT PRIMARY KEY, table_name VARCHAR(255) NOT NULL, operation ENUM('INSERT','UPDATE','DELETE') NOT NULL, row_data JSON NOT NULL, old_data JSON, changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, processed BOOLEAN DEFAULT FALSE)`);
  }

  private pollChanges(callback: (event: CDCEvent) => void): void {
    const poll = async () => {
      if (!this.running || !this.pool) return;
      try {
        const [rows] = await this.pool.query(`SELECT id, table_name, operation, row_data, old_data, changed_at FROM _pulsyn_changes WHERE processed = FALSE ORDER BY id ASC LIMIT 100`);
        for (const row of rows as any[]) {
          callback({ id: `evt-${row.id}`, operation: row.operation, table: row.table_name, timestamp: new Date(row.changed_at), data: typeof row.row_data === 'string' ? JSON.parse(row.row_data) : row.row_data, lsn: String(row.id) });
        }
        if ((rows as any[]).length > 0) {
          await this.pool.query('UPDATE _pulsyn_changes SET processed = TRUE WHERE id <= ?', [(rows as any[])[(rows as any[]).length - 1].id]);
        }
      } catch (err) { console.error('[MariaDB CDC] Poll error:', err); }
    };
    poll();
    this.pollingTimer = setInterval(poll, 1000);
  }
}
