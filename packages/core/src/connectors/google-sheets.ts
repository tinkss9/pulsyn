// @ts-nocheck
// Google Sheets Connector — spreadsheet source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('google-sheets')
export class GoogleSheetsConnector extends BaseConnector {
  private token: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'google-sheets', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.token = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['spreadsheets']; }

  async getTableSchema(): Promise<TableSchema> {
    return {
      name: 'spreadsheets',
      columns: [
        { name: 'spreadsheetId', type: 'string', nullable: false },
        { name: 'title', type: 'string', nullable: true },
        { name: 'createdTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['spreadsheetId'],
    };
  }

  async extractFull(): Promise<UnifiedChangeEvent[]> {
    const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets?pageSize=100', {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const data = await res.json() as any;
    return (data.files || []).map((item: any) =>
      createEvent({ op: 'S', table: 'spreadsheets', after: item, watermark: item.spreadsheetId })
    );
  }

  async startCDC(): Promise<void> { throw new Error('Google Sheets CDC requires polling'); }
  async stopCDC(): Promise<void> {}
}



