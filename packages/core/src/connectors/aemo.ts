// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface AemoConfig extends DatabaseConfig {
  baseUrl?: string;
  pollIntervalMs?: number;
}

const NEMWEB_BASE = 'https://nemweb.com.au/Reports/Current';

const TABLE_PATHS: Record<string, string> = {
  DISPATCHPRICE: '/Dispatch_SCADA/',
  DISPATCHREGIONSUM: '/DispatchIS_Reports/',
  DISPATCH_UNIT_SCADA: '/Dispatch_SCADA/',
  TRADINGPRICE: '/TradingIS_Reports/',
  ROOFTOP_PV_ACTUAL: '/ROOFTOP_PV/ACTUAL/',
};

@registerSource('aemo')
export class AemoConnector extends BaseConnector {
  private baseUrl = NEMWEB_BASE;
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;
  private lastSeen: Record<string, string> = {};

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const ac = config as AemoConfig;
      this.baseUrl = ac.baseUrl || NEMWEB_BASE;

      const res = await fetch(this.baseUrl, { method: 'HEAD' });
      if (!res.ok && res.status !== 405) {
        throw new Error(`NEMWEB unreachable: HTTP ${res.status}`);
      }
      this.connected = true;
    } catch (error) {
      throw new Error(`AEMO connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(this.baseUrl, { method: 'HEAD' });
      return res.ok || res.status === 405;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    return Object.keys(TABLE_PATHS);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schemas: Record<string, TableSchema> = {
      DISPATCHPRICE: {
        table, primaryKey: ['SETTLEMENTDATE'],
        columns: [
          { name: 'SETTLEMENTDATE', type: 'timestamp', nullable: false, defaultValue: undefined },
          { name: 'REGIONID', type: 'varchar', nullable: false, defaultValue: undefined },
          { name: 'RRP', type: 'decimal', nullable: false, defaultValue: undefined },
          { name: 'INTERVENTION', type: 'integer', nullable: true, defaultValue: undefined },
          { name: 'RAISE6SECRRP', type: 'decimal', nullable: true, defaultValue: undefined },
        ],
      },
      DISPATCHREGIONSUM: {
        table, primaryKey: ['SETTLEMENTDATE'],
        columns: [
          { name: 'SETTLEMENTDATE', type: 'timestamp', nullable: false, defaultValue: undefined },
          { name: 'REGIONID', type: 'varchar', nullable: false, defaultValue: undefined },
          { name: 'TOTALDEMAND', type: 'decimal', nullable: false, defaultValue: undefined },
          { name: 'AVAILABLEGENERATION', type: 'decimal', nullable: true, defaultValue: undefined },
          { name: 'CLEAREDSUPPLY', type: 'decimal', nullable: true, defaultValue: undefined },
        ],
      },
      DISPATCH_UNIT_SCADA: {
        table, primaryKey: ['SETTLEMENTDATE'],
        columns: [
          { name: 'SETTLEMENTDATE', type: 'timestamp', nullable: false, defaultValue: undefined },
          { name: 'DUID', type: 'varchar', nullable: false, defaultValue: undefined },
          { name: 'SCADAVALUE', type: 'decimal', nullable: true, defaultValue: undefined },
        ],
      },
      TRADINGPRICE: {
        table, primaryKey: ['SETTLEMENTDATE'],
        columns: [
          { name: 'SETTLEMENTDATE', type: 'timestamp', nullable: false, defaultValue: undefined },
          { name: 'REGIONID', type: 'varchar', nullable: false, defaultValue: undefined },
          { name: 'RRP', type: 'decimal', nullable: false, defaultValue: undefined },
          { name: 'PERIODID', type: 'integer', nullable: false, defaultValue: undefined },
        ],
      },
      ROOFTOP_PV_ACTUAL: {
        table, primaryKey: ['INTERVAL_DATETIME'],
        columns: [
          { name: 'INTERVAL_DATETIME', type: 'timestamp', nullable: false, defaultValue: undefined },
          { name: 'REGIONID', type: 'varchar', nullable: false, defaultValue: undefined },
          { name: 'POWER', type: 'decimal', nullable: false, defaultValue: undefined },
          { name: 'QI', type: 'decimal', nullable: true, defaultValue: undefined },
          { name: 'TYPE', type: 'varchar', nullable: true, defaultValue: undefined },
        ],
      },
    };
    return schemas[table] || { table, columns: [], primaryKey: [] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    const pollMs = (this.config as AemoConfig)?.pollIntervalMs || 300000; // 5 minutes

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive) return;
      try {
        const tables = await this.getTables();
        for (const table of tables) {
          const files = await this.listRemoteFiles(table);
          const newFiles = files.filter((f) => !this.lastSeen[`${table}:${f}`]);
          for (const file of newFiles) {
            const rows = await this.fetchAndParseCsv(`${this.baseUrl}${TABLE_PATHS[table]}${file}`);
            for (const row of rows) {
              callback({ op: 'I', table, before: undefined, after: row, ts: new Date() });
            }
            this.lastSeen[`${table}:${file}`] = new Date().toISOString();
          }
        }
      } catch { /* polling error, retry next cycle */ }
    }, pollMs);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const path = TABLE_PATHS[table];
    if (!path) throw new Error(`Unknown AEMO table: ${table}`);

    const files = await this.listRemoteFiles(table);
    for (const file of files) {
      const rows = await this.fetchAndParseCsv(`${this.baseUrl}${path}${file}`);
      for (const row of rows) {
        const pk = row.SETTLEMENTDATE || row.INTERVAL_DATETIME || null;
        events.push(createEvent({ operation: "S", name: table, data: row, watermark: String(null || ""), sourceMetadata: pk }));
      }
      this.lastSeen[`${table}:${file}`] = new Date().toISOString();
    }
    return events;
  }

  async extractIncremental(name: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const events: UnifiedChangeEvent[] = [];
    const path = TABLE_PATHS[table];
    if (!path) throw new Error(`Unknown AEMO table: ${table}`);

    const files = await this.listRemoteFiles(table);
    const newFiles = watermark
      ? files.filter((f) => !this.lastSeen[`${table}:${f}`])
      : files.slice(-5);

    for (const file of newFiles) {
      const rows = await this.fetchAndParseCsv(`${this.baseUrl}${path}${file}`);
      for (const row of rows) {
        const ts = row.SETTLEMENTDATE || row.INTERVAL_DATETIME || new Date().toISOString();
        events.push(createEvent({ operation: "I", name: table, data: row, watermark: String(null || ""), sourceMetadata: ts }));
      }
      this.lastSeen[`${table}:${file}`] = new Date().toISOString();
    }
    return events;
  }

  private async listRemoteFiles(table: string): Promise<string[]> {
    const path = TABLE_PATHS[table];
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new Error(`Failed to list NEMWEB files: HTTP ${res.status}`);
    const html = await res.text();
    const filePattern = /href="([^"]+\.zip)"/gi;
    const files: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = filePattern.exec(html)) !== null) {
      files.push(match[1]);
    }
    return files.sort();
  }

  private async fetchAndParseCsv(url: string): Promise<Record<string, any>[]> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    const csvContent = await this.decompressZip(Buffer.from(buffer));
    return this.parseCsv(csvContent);
  }

  private async decompressZip(data: Buffer): Promise<string> {
    // Uses JSZip or similar — extract first CSV from ZIP
    const { Readable } = await import('stream');
    const zlib = await import('zlib');
    // NEMWEB ZIPs contain single CSV; use basic unzip
    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(data);
      const fileName = Object.keys(zip.files).find((f) => f.endsWith('.CSV') || f.endsWith('.csv'));
      if (!fileName) return '';
      return await zip.files[fileName].async('string');
    } catch {
      return data.toString('utf-8');
    }
  }

  private parseCsv(content: string): Record<string, any>[] {
    const lines = content.split('\n').filter((l) => l.trim());
    if (lines.length < 3) return [];
    // AEMO CSV format: line type C=comment, I=header, D=data
    const headerLine = lines.find((l) => l.startsWith('I,'));
    const dataLines = lines.filter((l) => l.startsWith('D,'));
    if (!headerLine) return [];

    const headers = headerLine.split(',').slice(1); // skip type indicator
    return dataLines.map((line) => {
      const values = line.split(',').slice(1);
      const row: Record<string, any> = {};
      headers.forEach((h, i) => {
        const val = values[i]?.trim().replace(/^"|"$/g, '');
        row[h.trim()] = isNaN(Number(val)) ? val : Number(val);
      });
      return row;
    });
  }
}






