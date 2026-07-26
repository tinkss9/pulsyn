// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface OracleUtilitiesConfig extends DatabaseConfig {
  restBaseUrl?: string;
  connectString?: string;
  authToken?: string;
  pollIntervalMs?: number;
}

const TABLE_DEFINITIONS: Record<string, { pk: string; wmColumn: string; columns: any[] }> = {
  CI_ACCT: {
    pk: 'ACCT_ID',
    wmColumn: 'LAST_UPDATE_DTTM',
    columns: [
      { name: 'ACCT_ID', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'ACCT_NAME', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'CIS_DIVISION', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'ACCT_STATUS_FLG', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'SETUP_DT', type: 'date', nullable: true, defaultValue: undefined },
      { name: 'LAST_UPDATE_DTTM', type: 'timestamp', nullable: true, defaultValue: undefined },
    ],
  },
  CI_PREM: {
    pk: 'PREM_ID',
    wmColumn: 'LAST_UPDATE_DTTM',
    columns: [
      { name: 'PREM_ID', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'PREM_TYPE_CD', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'ADDRESS1', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'CITY', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'STATE', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'POSTAL', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'LAST_UPDATE_DTTM', type: 'timestamp', nullable: true, defaultValue: undefined },
    ],
  },
  CI_MTR: {
    pk: 'MTR_ID',
    wmColumn: 'LAST_UPDATE_DTTM',
    columns: [
      { name: 'MTR_ID', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'MTR_TYPE_CD', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'MFG_SERIAL_NBR', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'MTR_STATUS_FLG', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'INSTALL_DT', type: 'date', nullable: true, defaultValue: undefined },
      { name: 'LAST_UPDATE_DTTM', type: 'timestamp', nullable: true, defaultValue: undefined },
    ],
  },
  CI_BSEG: {
    pk: 'BSEG_ID',
    wmColumn: 'LAST_UPDATE_DTTM',
    columns: [
      { name: 'BSEG_ID', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'SA_ID', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'START_DT', type: 'date', nullable: true, defaultValue: undefined },
      { name: 'END_DT', type: 'date', nullable: true, defaultValue: undefined },
      { name: 'BILL_AMT', type: 'decimal', nullable: true, defaultValue: undefined },
      { name: 'LAST_UPDATE_DTTM', type: 'timestamp', nullable: true, defaultValue: undefined },
    ],
  },
  CI_FT: {
    pk: 'FT_ID',
    wmColumn: 'LAST_UPDATE_DTTM',
    columns: [
      { name: 'FT_ID', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'SA_ID', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'FT_TYPE_FLG', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'CUR_AMT', type: 'decimal', nullable: true, defaultValue: undefined },
      { name: 'FREEZE_DTTM', type: 'timestamp', nullable: true, defaultValue: undefined },
      { name: 'LAST_UPDATE_DTTM', type: 'timestamp', nullable: true, defaultValue: undefined },
    ],
  },
  CI_SA: {
    pk: 'SA_ID',
    wmColumn: 'LAST_UPDATE_DTTM',
    columns: [
      { name: 'SA_ID', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'ACCT_ID', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'SA_TYPE_CD', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'SA_STATUS_FLG', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'START_DT', type: 'date', nullable: true, defaultValue: undefined },
      { name: 'LAST_UPDATE_DTTM', type: 'timestamp', nullable: true, defaultValue: undefined },
    ],
  },
  CI_SP: {
    pk: 'SP_ID',
    wmColumn: 'LAST_UPDATE_DTTM',
    columns: [
      { name: 'SP_ID', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'PREM_ID', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'SP_TYPE_CD', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'SP_STATUS_FLG', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'INSTALL_DT', type: 'date', nullable: true, defaultValue: undefined },
      { name: 'LAST_UPDATE_DTTM', type: 'timestamp', nullable: true, defaultValue: undefined },
    ],
  },
};

@registerSource('oracle-utilities')
export class OracleUtilitiesConnector extends BaseConnector {
  private oraPool: any = null;
  private restBaseUrl = '';
  private authToken = '';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;
  private lastWatermark: Record<string, string> = {};

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const oc = config as OracleUtilitiesConfig;
      this.restBaseUrl = oc.restBaseUrl || `https://${config.host}/ouaf/webservices/rest`;
      this.authToken = oc.authToken || '';

      const oracledb = await import('oracledb');
      this.oraPool = await oracledb.default.createPool({
        user: config.user,
        password: config.password,
        connectString: oc.connectString || `${config.host}:${config.port || 1521}/${config.database}`,
        poolMin: 2,
        poolMax: 10,
      });

      // Test connection
      const conn = await this.oraPool.getConnection();
      await conn.execute('SELECT 1 FROM DUAL');
      await conn.close();
      this.connected = true;
    } catch (error) {
      throw new Error(`Oracle Utilities connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    if (this.oraPool) {
      try { await this.oraPool.close(0); } catch { /* ignore */ }
      this.oraPool = null;
    }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.oraPool) return false;
      const conn = await this.oraPool.getConnection();
      const result = await conn.execute('SELECT 1 AS OK FROM DUAL');
      await conn.close();
      return result.rows?.length > 0;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    return Object.keys(TABLE_DEFINITIONS);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = TABLE_DEFINITIONS[table];
    if (!def) return { table, columns: [], primaryKey: [] };
    return { table, columns: def.columns, primaryKey: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const pollMs = (this.config as OracleUtilitiesConfig)?.pollIntervalMs || 60000;

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const tables = await this.getTables();
        for (const table of tables) {
          const def = TABLE_DEFINITIONS[table];
          const since = this.lastWatermark[table] || new Date(Date.now() - pollMs).toISOString();
          const conn = await this.oraPool.getConnection();
          try {
            const result = await conn.execute(
              `SELECT * FROM ${table} WHERE ${def.wmColumn} > TO_TIMESTAMP(:wm, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') ORDER BY ${def.wmColumn} FETCH FIRST 500 ROWS ONLY`,
              { wm: since },
              { outFormat: 4002 } // OBJECT format
            );
            for (const row of result.rows || []) {
              callback({ operation: 'UPDATE', table, before: undefined, after: row, ts: new Date() });
            }
          } finally {
            await conn.close();
          }
          this.lastWatermark[table] = new Date().toISOString();
        }
      } catch { /* retry next cycle */ }
    }, pollMs);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const def = TABLE_DEFINITIONS[table];
    if (!def) throw new Error(`Unknown Oracle Utilities table: ${table}`);
    if (!this.oraPool) throw new Error('Not connected');

    const events: UnifiedChangeEvent[] = [];
    let lastKey: string | null = null;
    const conn = await this.oraPool.getConnection();

    try {
      while (true) {
        const sql = lastKey
          ? `SELECT * FROM ${table} WHERE ${def.pk} > :lastKey ORDER BY ${def.pk} FETCH FIRST :batchSize ROWS ONLY`
          : `SELECT * FROM ${table} ORDER BY ${def.pk} FETCH FIRST :batchSize ROWS ONLY`;
        const binds = lastKey
          ? { lastKey, batchSize: this.batchSize }
          : { batchSize: this.batchSize };
        const result = await conn.execute(sql, binds, { outFormat: 4002 });
        const rows = result.rows || [];
        if (rows.length === 0) break;

        for (const row of rows) {
          events.push(createEvent({ operation: "S", name: table, data: row, watermark: String(null || ""), sourceMetadata: row[def.pk]?.toString() }));
        }
        lastKey = rows[rows.length - 1][def.pk]?.toString();
        if (rows.length < this.batchSize) break;
      }
    } finally {
      await conn.close();
    }
    this.lastWatermark[table] = new Date().toISOString();
    return events;
  }

  async extractIncremental(name: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = TABLE_DEFINITIONS[table];
    if (!def) throw new Error(`Unknown Oracle Utilities table: ${table}`);
    if (!this.oraPool) throw new Error('Not connected');

    const events: UnifiedChangeEvent[] = [];
    const since = watermark || new Date(Date.now() - 3600000).toISOString();
    const conn = await this.oraPool.getConnection();

    try {
      const result = await conn.execute(
        `SELECT * FROM ${table} WHERE ${def.wmColumn} > TO_TIMESTAMP(:wm, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"') ORDER BY ${def.wmColumn} FETCH FIRST :batchSize ROWS ONLY`,
        { wm: since, batchSize: this.batchSize },
        { outFormat: 4002 }
      );
      for (const row of (result.rows || [])) {
        const ts = row[def.wmColumn]?.toISOString() || new Date().toISOString();
        events.push(createEvent({ operation: "I", name: table, data: row, watermark: String(null || ""), sourceMetadata: ts }));
      }
    } finally {
      await conn.close();
    }
    this.lastWatermark[table] = new Date().toISOString();
    return events;
  }

  private async fetchRest(entity: string, id?: string): Promise<any> {
    const url = id
      ? `${this.restBaseUrl}/${entity}/${id}`
      : `${this.restBaseUrl}/${entity}`;
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`REST error for ${entity}: HTTP ${res.status}`);
    return res.json();
  }
}






