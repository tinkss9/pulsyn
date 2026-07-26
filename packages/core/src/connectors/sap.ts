// SAP Connector — enterprise ERP source
// npm install node-rfc

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let Client: any;
try { Client = require('node-rfc').Client; } catch {}

@registerSource('sap')
export class SAPConnector extends BaseConnector {
  private client: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'sap', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!Client) throw new Error('node-rfc not installed');
    this.client = new Client({
      user: config.user, passwd: config.password,
      ashost: config.host, sysnr: String((config as any).systemNumber || '00'),
      client: String((config as any).client || '100'),
    });
    await this.client.open();
    this.connected = true;
  }

  async disconnect(): Promise<void> { if (this.client) { await this.client.close(); this.client = null; } this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.call('RFC_PING'); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    // SAP tables via RFC_READ_TABLE
    const result = await this.client.call('RFC_READ_TABLE', {
      QUERY_TABLE: 'DD02L', ROWCOUNT: 100,
      FIELDS: [{ FIELDNAME: 'TABNAME' }],
      OPTIONS: [{ TEXT: "TABCLASS = 'TRANSP'" }],
    });
    return [...new Set(result.DATA.map((r: any) => r.WA.trim()))] as string[];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const result = await this.client.call('RFC_READ_TABLE', {
      QUERY_TABLE: 'DD03L', ROWCOUNT: 500,
      FIELDS: [{ FIELDNAME: 'FIELDNAME' }, { FIELDNAME: 'DATATYPE' }, { FIELDNAME: 'KEYFLAG' }],
      OPTIONS: [{ TEXT: `TABNAME = '${table}'` }],
    });
    return {
      name: table,
      columns: result.DATA.map((r: any) => ({ name: r.WA.substring(0, 30).trim(), type: r.WA.substring(30, 40).trim(), nullable: true })),
      primaryKey: result.DATA.filter((r: any) => r.WA.substring(40, 41) === 'X').map((r: any) => r.WA.substring(0, 30).trim()),
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const result = await this.client.call('RFC_READ_TABLE', { QUERY_TABLE: table, ROWCOUNT: this.batchSize });
    return result.DATA.map((row: any) => {
      const data: Record<string, any> = {};
      result.FIELDS.forEach((f: any, i: number) => { data[f.FIELDNAME] = row.WA.substring(f.OFFSET, f.OFFSET + f.LENGTH).trim(); });
      return createEvent({ op: 'S', table, after: data });
    });
  }

  async startCDC(): Promise<void> { throw new Error('SAP CDC requires SAP SLT or Event Mesh — not yet implemented'); }
  async stopCDC(): Promise<void> {}
}
