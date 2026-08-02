// Vatican Museums API — Collection data (no auth, via Smithsonian open access)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('dummyimage')
export class DummyImageConnector extends BaseConnector {
  private baseUrl = 'https://dummyimage.com';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/300`, { method: 'HEAD' });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['images'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'width', type: 'number', nullable: false },
        { name: 'height', type: 'number', nullable: false },
        { name: 'background', type: 'string', nullable: true },
        { name: 'foreground', type: 'string', nullable: true },
        { name: 'text', type: 'string', nullable: true },
        { name: 'format', type: 'string', nullable: false },
      ],
      primaryKeys: [],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const sizes = ['300x200', '640x480', '100x100', '800x600', '1920x1080'];
    return sizes.map((size, i) => {
      const [w, h] = size.split('x');
      return createEvent({ op: 'S', table: 'images', after: {
        width: parseInt(w), watermark: height: parseInt(h }), format: 'png',
        url: `${this.baseUrl}/${size}`,
      }, String(i));
    });
  }

  async extractIncremental(table: string): Promise<UnifiedChangeEvent[]> {
    return [];
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
  }
}
