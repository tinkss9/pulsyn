// @ts-nocheck
import { Client as RfcClient } from 'node-rfc';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('sap')
export class SAPConnector extends BaseConnector {
  private client: RfcClient | null = null;
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      this.client = new RfcClient({
        ashost: config.host,
        sysnr: config.port?.toString() || '00',
        client: (config as any).sapClient || '100',
        user: config.username,
        passwd: config.password,
        lang: 'EN',
      });
      await this.client.open();
      this.connected = true;
    } catch (error) {
      throw new Error(`SAP connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.stopCDC();
      if (this.client) {
        await this.client.close();
        this.client = null;
      }
      this.connected = false;
    } catch (error) {
      throw new Error(`SAP disconnect failed: ${(error as Error).message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.call('RFC_PING', {});
      return true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.client) throw new Error('Not connected');
    try {
      const result = await this.client.call('RFC_READ_TABLE', {
        QUERY_TABLE: 'DD02L',
        DELIMITER: '|',
        FIELDS: [{ FIELDNAME: 'TABNAME' }],
        OPTIONS: [{ TEXT: "TABCLASS = 'TRANSP'" }],
        ROWCOUNT: 1000,
      });
      const data = (result.DATA as any[]) || [];
      return data.map((row) => (row.WA as string).trim());
    } catch (error) {
      throw new Error(`Failed to list tables: ${(error as Error).message}`);
    }
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.client) throw new Error('Not connected');
    try {
      const result = await this.client.call('RFC_READ_TABLE', {
        QUERY_TABLE: 'DD03L',
        DELIMITER: '|',
        FIELDS: [
          { FIELDNAME: 'FIELDNAME' },
          { FIELDNAME: 'DATATYPE' },
          { FIELDNAME: 'KEYFLAG' },
        ],
        OPTIONS: [{ TEXT: `TABNAME = '${table}'` }],
      });
      const data = (result.DATA as any[]) || [];
      const columns: TableSchema['columns'] = [];
      const primaryKey: string[] = [];

      for (const row of data) {
        const parts = (row.WA as string).split('|').map((s: string) => s.trim());
        const [name, type, keyFlag] = parts;
        if (!name || name.startsWith('.')) continue;
        columns.push({ name, type, nullable: keyFlag !== 'X', defaultValue: undefined });
        if (keyFlag === 'X') primaryKeys.push(name);
      }
      return { table, columns, primaryKeys };
    } catch (error) {
      throw new Error(`Failed to get schema for ${table}: ${(error as Error).message}`);
    }
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    try {
      this.cdcActive = true;
      let lastTimestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

      this.cdcTimer = setInterval(async () => {
        if (!this.cdcActive || !this.client) return;
        try {
          const tables = await this.getTables();
          const targetTables = tables.slice(0, 10); // monitor first 10
          for (const table of targetTables) {
            const result = await this.client!.call('RFC_READ_TABLE', {
              QUERY_name: table,
              DELIMITER: '|',
              OPTIONS: [{ TEXT: `CHANGED_AT > '${lastTimestamp}'` }],
              ROWCOUNT: this.batchSize,
            });
            const data = (result.DATA as any[]) || [];
            for (const row of data) {
              callback({
                operation: 'UPDATE', table,
                before: undefined, after: { raw: row.WA },
                ts: new Date(),
              });
            }
          }
          lastTimestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
        } catch { /* polling error, retry next interval */ }
      }, 5000);
    } catch (error) {
      throw new Error(`Failed to start CDC: ${(error as Error).message}`);
    }
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.client) throw new Error('Not connected');
    const events: UnifiedChangeEvent[] = [];
    let offset = 0;

    while (true) {
      try {
        const result = await this.client.call('RFC_READ_TABLE', {
          QUERY_name: table,
          DELIMITER: '|',
          ROWSKIPS: offset,
          ROWCOUNT: this.batchSize,
        });
        const fields = (result.FIELDS as any[]) || [];
        const fieldNames = fields.map((f) => (f.FIELDNAME as string).trim());
        const data = (result.DATA as any[]) || [];

        if (data.length === 0) break;
        for (const row of data) {
          const values = (row.WA as string).split('|').map((s: string) => s.trim());
          const record: Record<string, any> = {};
          fieldNames.forEach((name, i) => { record[name] = values[i] || null; });
          events.push(createEvent({ operation: "S", name: table, data: record, watermark: String(null || ""), sourceMetadata: offset.toString() }));
          offset++;
        }
        if (data.length < this.batchSize) break;
      } catch (error) {
        throw new Error(`Extract failed at offset ${offset}: ${(error as Error).message}`);
      }
    }
    return events;
  }

  async extractIncremental(name: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.client) throw new Error('Not connected');
    const wmCol = this.config.watermarkColumn || 'CHANGED_AT';
    const events: UnifiedChangeEvent[] = [];
    const options = watermark ? [{ TEXT: `${wmCol} > '${watermark}'` }] : [];

    try {
      const result = await this.client.call('RFC_READ_TABLE', {
        QUERY_name: table,
        DELIMITER: '|',
        OPTIONS: options,
        ROWCOUNT: this.batchSize,
      });
      const fields = (result.FIELDS as any[]) || [];
      const fieldNames = fields.map((f) => (f.FIELDNAME as string).trim());
      const data = (result.DATA as any[]) || [];

      for (const row of data) {
        const values = (row.WA as string).split('|').map((s: string) => s.trim());
        const record: Record<string, any> = {};
        fieldNames.forEach((name, i) => { record[name] = values[i] || null; });
        events.push(createEvent({ operation: "I", name: table, data: record, watermark: String(null || ""), sourceMetadata: record[wmCol] || null }));
      }
    } catch (error) {
      throw new Error(`Incremental extract failed: ${(error as Error).message}`);
    }
    return events;
  }
}






