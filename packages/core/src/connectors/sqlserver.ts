// @ts-nocheck
// SQL Server Connector — DMS-inspired with Change Tracking CDC
// Ported from DMS Replicate src/extractors/connectors/sqlserver_connector.py

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let mssql: any;
try { mssql = require('mssql'); } catch {}

@registerSource('sqlserver')
export class SQLServerConnector extends BaseConnector {
  private pool: any = null;
  private running = false;
  private pollingTimer: NodeJS.Timeout | null = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'sqlserver', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!mssql) throw new Error('mssql not installed. Run: npm install mssql');
    this.pool = await mssql.connect({
      server: config.host,
      port: config.port || 1433,
      database: config.database,
      user: config.user,
      password: config.password,
      options: { encrypt: config.ssl || false, trustServerCertificate: true },
    });
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    if (this.pool) { await this.pool.close(); this.pool = null; }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      await this.pool.request().query('SELECT 1');
      return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const result = await this.pool.request().query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME`
    );
    return result.recordset.map((r: any) => r.TABLE_NAME);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const cols = await this.pool.request().query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}' ORDER BY ORDINAL_POSITION`
    );
    const pks = await this.pool.request().query(
      `SELECT ccu.COLUMN_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME WHERE tc.TABLE_NAME = '${table}' AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'`
    );
    return {
      name: table,
      columns: cols.recordset.map((r: any) => ({ name: r.COLUMN_NAME, type: r.DATA_TYPE, nullable: r.IS_NULLABLE === 'YES' })),
      primaryKey: pks.recordset.map((r: any) => r.COLUMN_NAME),
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const result = await this.pool.request().query(`SELECT TOP ${this.batchSize} * FROM [${table}]`);
    return result.recordset.map((row: any) => createEvent({ op: 'S', table, after: row, watermark: String(row.id || 0) }));
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    let sql;
    if (watermark) {
      sql = `SELECT TOP ${this.batchSize} * FROM [${table}] WHERE id > ${watermark} ORDER BY id`;
    } else {
      sql = `SELECT TOP ${this.batchSize} * FROM [${table}] ORDER BY id`;
    }
    const result = await this.pool.request().query(sql);
    return result.recordset.map((row: any) => createEvent({ op: 'I', table, after: row, watermark: String(row.id || 0) }));
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    // Enable Change Tracking if not already
    await this.pool.request().query(`ALTER DATABASE ${this.pool.config.database} SET CHANGE_TRACKING = ON (CHANGE_RETENTION = 7 DAYS, AUTO_CLEANUP = ON)`).catch(() => {});
    
    const tables = await this.getTables();
    for (const table of tables) {
      await this.pool.request().query(`ALTER TABLE [${table}] ENABLE CHANGE_TRACKING`).catch(() => {});
    }
    
    this.running = true;
    this.pollCT(callback);
  }

  async stopCDC(): Promise<void> {
    this.running = false;
    if (this.pollingTimer) { clearInterval(this.pollingTimer); this.pollingTimer = null; }
  }

  private async pollCT(callback: (event: CDCEvent) => void): Promise<void> {
    // Poll Change Tracking tables
    const poll = async () => {
      if (!this.running || !this.pool) return;
      try {
        const tables = await this.getTables();
        for (const table of tables) {
          const result = await this.pool.request().query(
            `SELECT * FROM CHANGETABLE(CHANGES [${table}], 0) AS ct ORDER BY SYS_CHANGE_VERSION`
          );
          for (const row of result.recordset) {
            const op = row.SYS_CHANGE_OPERATION === 'I' ? 'INSERT' : row.SYS_CHANGE_OPERATION === 'U' ? 'UPDATE' : 'DELETE';
            callback({
              id: `ct-${row.SYS_CHANGE_VERSION}-${table}`,
              operation: op as any,
              table,
              timestamp: new Date(),
              data: row,
              lsn: String(row.SYS_CHANGE_VERSION),
            });
          }
        }
      } catch (err) { console.error('[SQLServer CDC] Poll error:', err); }
    };
    poll();
    this.pollingTimer = setInterval(poll, 1000);
  }
}



