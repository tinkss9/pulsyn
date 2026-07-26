// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface SapIsuConfig extends DatabaseConfig {
  ashost: string;
  sysnr: string;
  client: string;
  lang?: string;
  pollIntervalMs?: number;
}

const TABLE_BAPIS: Record<string, { bapi: string; pk: string; params?: Record<string, any> }> = {
  EANLH: { bapi: 'BAPI_ISUACCOUNT_GETLIST', pk: 'ANLAGE' },
  EGERH: { bapi: 'BAPI_METER_GETLIST', pk: 'EQUNR' },
  ERCH: { bapi: 'BAPI_BILLDOC_GETLIST', pk: 'BELNR' },
  DBERCHZ: { bapi: 'BAPI_BILLDOC_GETDETAIL', pk: 'BELNR' },
  ETTIFN: { bapi: 'BAPI_RATE_GETLIST', pk: 'TAESSION' },
};

const TABLE_SCHEMAS: Record<string, { columns: any[]; pk: string }> = {
  EANLH: {
    pk: 'ANLAGE',
    columns: [
      { name: 'ANLAGE', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'VKONTO', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'VSTELLE', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'ANLART', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'AB', type: 'date', nullable: true, defaultValue: null },
      { name: 'BIS', type: 'date', nullable: true, defaultValue: null },
      { name: 'CHANGED_AT', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  EGERH: {
    pk: 'EQUNR',
    columns: [
      { name: 'EQUNR', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'MAESSION', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'GEESSION', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'ZWESSION', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'ABLHINW', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'EINESSION', type: 'date', nullable: true, defaultValue: null },
      { name: 'CHANGED_AT', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  ERCH: {
    pk: 'BELNR',
    columns: [
      { name: 'BELNR', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'VKONTO', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'BEGABRPE', type: 'date', nullable: true, defaultValue: null },
      { name: 'ENDABRPE', type: 'date', nullable: true, defaultValue: null },
      { name: 'BETRAG', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'WAESSION', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'CHANGED_AT', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  DBERCHZ: {
    pk: 'BELNR',
    columns: [
      { name: 'BELNR', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'BELZEILE', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'BETRAG', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'MESSION', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'PREESSION', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'STTARIF', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'CHANGED_AT', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
  ETTIFN: {
    pk: 'TAESSION',
    columns: [
      { name: 'TAESSION', type: 'varchar', nullable: false, defaultValue: null },
      { name: 'TARIESSION', type: 'varchar', nullable: true, defaultValue: null },
      { name: 'AB', type: 'date', nullable: true, defaultValue: null },
      { name: 'BIS', type: 'date', nullable: true, defaultValue: null },
      { name: 'PREISE', type: 'decimal', nullable: true, defaultValue: null },
      { name: 'CHANGED_AT', type: 'timestamp', nullable: true, defaultValue: null },
    ],
  },
};

@registerSource('sap-isu')
export class SapIsuConnector extends BaseConnector {
  private rfcClient: any = null;
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;
  private lastWatermark: Record<string, string> = {};

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const sc = config as SapIsuConfig;
      const { Client } = await import('node-rfc');

      this.rfcClient = new Client({
        ashost: sc.ashost || sc.host,
        sysnr: sc.sysnr || '00',
        client: sc.client || '100',
        user: sc.user,
        passwd: sc.password,
        lang: sc.lang || 'EN',
      });
      await this.rfcClient.open();
      this.connected = true;
    } catch (error) {
      throw new Error(`SAP ISU connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    if (this.rfcClient) {
      try { await this.rfcClient.close(); } catch { /* ignore */ }
      this.rfcClient = null;
    }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.rfcClient) return false;
      const result = await this.rfcClient.call('RFC_PING');
      return result !== undefined;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    return Object.keys(TABLE_BAPIS);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schema = TABLE_SCHEMAS[table];
    if (!schema) return { table, columns: [], primaryKeys: [] };
    return { table, columns: schema.columns, primaryKeys: [schema.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const pollMs = (this.config as SapIsuConfig)?.pollIntervalMs || 300000; // 5 min

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const tables = await this.getTables();
        for (const table of tables) {
          const since = this.lastWatermark[table] || this.formatSapTimestamp(
            new Date(Date.now() - pollMs)
          );
          const rows = await this.fetchByTimestamp(table, since);
          for (const row of rows) {
            callback({ op: 'U', table, before: null, after: row, ts: new Date() });
          }
          this.lastWatermark[table] = this.formatSapTimestamp(new Date());
        }
      } catch { /* retry next cycle */ }
    }, pollMs);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const def = TABLE_BAPIS[table];
    if (!def) throw new Error(`Unknown SAP ISU table: ${table}`);
    if (!this.rfcClient) throw new Error('Not connected');

    const events: UnifiedChangeEvent[] = [];
    let offset = 0;
    const maxRows = this.batchSize;

    while (true) {
      const result = await this.callBapi(def.bapi, {
        MAX_ROWS: maxRows,
        ROWSKIPS: offset,
      });
      const rows = this.extractRows(result, table);
      if (rows.length === 0) break;

      for (const row of rows) {
        events.push(createEvent('S', table, row, null, row[def.pk]?.toString(), { source: 'sap-isu' }));
      }
      offset += rows.length;
      if (rows.length < maxRows) break;
    }
    this.lastWatermark[table] = this.formatSapTimestamp(new Date());
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = TABLE_BAPIS[table];
    if (!def) throw new Error(`Unknown SAP ISU table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    const since = watermark || this.formatSapTimestamp(new Date(Date.now() - 3600000));

    const rows = await this.fetchByTimestamp(table, since);
    for (const row of rows) {
      const ts = row.CHANGED_AT || new Date().toISOString();
      events.push(createEvent('I', table, row, null, ts, { source: 'sap-isu' }));
    }
    this.lastWatermark[table] = this.formatSapTimestamp(new Date());
    return events;
  }

  private async fetchByTimestamp(table: string, since: string): Promise<Record<string, any>[]> {
    const def = TABLE_BAPIS[table];
    if (!def || !this.rfcClient) return [];

    const result = await this.callBapi(def.bapi, {
      MAX_ROWS: this.batchSize,
      CHANGED_AT_FROM: since,
    });
    return this.extractRows(result, table);
  }

  private async callBapi(bapi: string, params: Record<string, any>): Promise<any> {
    try {
      return await this.rfcClient.call(bapi, params);
    } catch (error) {
      throw new Error(`BAPI ${bapi} call failed: ${(error as Error).message}`);
    }
  }

  private extractRows(result: any, table: string): Record<string, any>[] {
    // SAP BAPIs typically return data in table parameters
    // Common patterns: ET_DATA, T_DATA, RETURN table
    const candidates = [
      result[`ET_${table}`],
      result[`T_${table}`],
      result.ET_DATA,
      result.T_DATA,
      result.ACCOUNT_LIST,
      result.METER_LIST,
      result.BILLDOC_LIST,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate) && candidate.length > 0) return candidate;
    }
    return [];
  }

  private formatSapTimestamp(date: Date): string {
    // SAP format: YYYYMMDDHHMMSS
    return date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  }
}

