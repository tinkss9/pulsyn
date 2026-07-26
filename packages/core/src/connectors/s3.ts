// @ts-nocheck
import {
  S3Client, ListObjectsV2Command, GetObjectCommand,
  ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { parse } from 'csv-parse/sync';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface S3Config extends DatabaseConfig {
  bucket: string;
  prefix?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  fileFormat?: 'csv' | 'json' | 'jsonl';
  delimiter?: string;
}

@registerSource('s3')
export class S3Connector extends BaseConnector {
  private client: S3Client | null = null;
  private bucket = '';
  private prefix = '';
  private fileFormat: 'csv' | 'json' | 'jsonl' = 'csv';
  private delimiter = ',';
  private cdcActive = false;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const sc = config as S3Config;
      this.bucket = sc.bucket || sc.database || '';
      this.prefix = sc.prefix || '';
      this.fileFormat = sc.fileFormat || 'csv';
      this.delimiter = sc.delimiter || ',';

      this.client = new S3Client({
        region: sc.region || 'us-east-1',
        credentials: sc.accessKeyId ? {
          accessKeyId: sc.accessKeyId,
          secretAccessKey: sc.secretAccessKey || '',
        } : undefined,
      });

      // Verify access
      await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucket, Prefix: this.prefix, MaxKeys: 1,
      }));
      this.connected = true;
    } catch (error) {
      throw new Error(`S3 connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.client = null;
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucket, Prefix: this.prefix, MaxKeys: 1,
      }));
      return true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.client) throw new Error('Not connected');
    try {
      const tables = new Set<string>();
      let token: string | undefined;

      do {
        const res: ListObjectsV2CommandOutput = await this.client.send(
          new ListObjectsV2Command({
            Bucket: this.bucket, Prefix: this.prefix,
            Delimiter: '/', ContinuationToken: token,
          })
        );
        // Common prefixes = directories = tables
        for (const p of res.CommonPrefixes || []) {
          if (p.Prefix) tables.add(p.Prefix.replace(this.prefix, '').replace(/\/$/, ''));
        }
        // Top-level files = tables
        for (const obj of res.Contents || []) {
          if (obj.Key) {
            const name = obj.Key.replace(this.prefix, '').split('/')[0].replace(/\.[^.]+$/, '');
            if (name) tables.add(name);
          }
        }
        token = res.NextContinuationToken;
      } while (token);

      return Array.from(tables).filter(Boolean);
    } catch (error) {
      throw new Error(`Failed to list tables: ${(error as Error).message}`);
    }
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.client) throw new Error('Not connected');
    try {
      const key = await this.findFirstFile(table);
      if (!key) return { table, columns: [], primaryKeys: [] };

      const content = await this.downloadFile(key);
      const sample = this.parseContent(content);
      if (sample.length === 0) return { table, columns: [], primaryKeys: [] };

      const columns = Object.entries(sample[0]).map(([name, value]) => ({
        name, type: typeof value === 'number' ? 'number' : 'string',
        nullable: true, defaultValue: null,
      }));
      return { table, columns, primaryKeys: columns.length > 0 ? [columns[0].name] : [] };
    } catch (error) {
      throw new Error(`Failed to get schema for ${table}: ${(error as Error).message}`);
    }
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    this.cdcActive = true;
    const knownKeys = new Set<string>();

    // Initial scan
    const objects = await this.listAllObjects();
    for (const obj of objects) { if (obj.Key) knownKeys.add(obj.Key); }

    this.cdcTimer = setInterval(async () => {
      if (!this.cdcActive || !this.client) return;
      try {
        const current = await this.listAllObjects();
        for (const obj of current) {
          if (obj.Key && !knownKeys.has(obj.Key)) {
            knownKeys.add(obj.Key);
            const table = obj.Key.replace(this.prefix, '').split('/')[0];
            callback({
              op: 'I', table,
              before: null, after: { key: obj.Key, size: obj.Size, lastModified: obj.LastModified },
              ts: obj.LastModified || new Date(),
            });
          }
        }
      } catch { /* retry next interval */ }
    }, 10000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.client) throw new Error('Not connected');
    const events: UnifiedChangeEvent[] = [];
    const files = await this.listTableFiles(table);

    for (const file of files) {
      try {
        const content = await this.downloadFile(file);
        const records = this.parseContent(content);
        for (let i = 0; i < records.length; i++) {
          events.push(createEvent('S', table, records[i], null, `${file}:${i}`, { source: 's3', key: file }));
        }
      } catch (error) {
        throw new Error(`Failed to extract ${file}: ${(error as Error).message}`);
      }
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.client) throw new Error('Not connected');
    const events: UnifiedChangeEvent[] = [];
    const wmDate = watermark ? new Date(watermark) : new Date(0);
    const files = await this.listTableFiles(table);
    const newFiles = files.filter((f) => !watermark || f > watermark);

    for (const file of newFiles.slice(0, 10)) {
      try {
        const content = await this.downloadFile(file);
        const records = this.parseContent(content);
        for (let i = 0; i < records.length; i++) {
          events.push(createEvent('I', table, records[i], null, file, { source: 's3', key: file }));
        }
      } catch { continue; }
    }
    return events;
  }

  private async downloadFile(key: string): Promise<string> {
    const res = await this.client!.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    return await res.Body!.transformToString('utf-8');
  }

  private parseContent(content: string): Record<string, any>[] {
    if (this.fileFormat === 'json') return JSON.parse(content);
    if (this.fileFormat === 'jsonl') {
      return content.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line));
    }
    return parse(content, { columns: true, delimiter: this.delimiter, skip_empty_lines: true, trim: true });
  }

  private async findFirstFile(table: string): Promise<string | null> {
    const files = await this.listTableFiles(table);
    return files[0] || null;
  }

  private async listTableFiles(table: string): Promise<string[]> {
    const prefix = `${this.prefix}${table}`;
    const res = await this.client!.send(new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, MaxKeys: 1000 }));
    return (res.Contents || []).map((o) => o.Key!).filter(Boolean);
  }

  private async listAllObjects(): Promise<any[]> {
    const res = await this.client!.send(new ListObjectsV2Command({ Bucket: this.bucket, Prefix: this.prefix, MaxKeys: 1000 }));
    return res.Contents || [];
  }
}

