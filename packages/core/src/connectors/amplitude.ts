// @ts-nocheck
// Amplitude Connector — product analytics source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('amplitude')
export class AmplitudeConnector extends BaseConnector {
  private apiKey: string = '';
  private secretKey: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'amplitude', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.apiKey = config.user;
    this.secretKey = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const auth = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');
      const res = await fetch('https://amplitude.com/api/2/usersearch', {
        headers: { Authorization: `Basic ${auth}` },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['events', 'users']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'event_type', type: 'string', nullable: true },
        { name: 'user_id', type: 'string', nullable: true },
        { name: 'timestamp', type: 'datetime', nullable: true },
        { name: 'properties', type: 'object', nullable: true },
      ],
      primaryKey: ['user_id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const auth = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');
    const start = new Date(Date.now() - 86400000).toISOString().replace(/[-:T]/g, '').substring(0, 8);
    const end = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 8);
    const res = await fetch(`https://amplitude.com/api/2/export?start=${start}&end=${end}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const text = await res.text();
    const lines = text.split('\n').filter(l => l.trim());
    return lines.slice(0, this.batchSize).map((line, i) => {
      const data = JSON.parse(line);
      return createEvent({ op: 'S', table, after: data, watermark: data.time || String(i) });
    });
  }

  async startCDC(): Promise<void> { throw new Error('Amplitude CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}



