// Amazon S3 Connector — Uses AWS SDK v3 (works with S3, MinIO, R2)
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { S3Client, ListBucketsCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

@registerSource('s3')
export class AmazonS3Connector extends BaseConnector {
  private client: S3Client | null = null;
  private bucket = '';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.bucket = (config as any).database || config.host || 'test-bucket';
    
    const endpoint = (config as any).endpoint || `https://s3.${(config as any).region || 'us-east-1'}.amazonaws.com`;
    
    this.client = new S3Client({
      endpoint,
      region: (config as any).region || 'us-east-1',
      credentials: {
        accessKeyId: (config as any).accessKeyId || config.username || '',
        secretAccessKey: (config as any).secretAccessKey || config.password || '',
      },
      forcePathStyle: (config as any).forcePathStyle ?? true,
    });
    
    // Validate connection by listing buckets
    await this.client.send(new ListBucketsCommand({}));
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.client?.destroy();
    this.client = null;
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.send(new ListBucketsCommand({}));
      return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    if (!this.client) throw new Error('Not connected');
    const res = await this.client.send(new ListObjectsV2Command({
      Bucket: this.bucket,
      Delimiter: '/',
    }));
    const tables: string[] = [];
    if (res.Contents) {
      for (const obj of res.Contents) {
        if (obj.Key && !obj.Key.endsWith('/')) tables.push(obj.Key);
      }
    }
    if (res.CommonPrefixes) {
      for (const prefix of res.CommonPrefixes) {
        if (prefix.Prefix) tables.push(prefix.Prefix);
      }
    }
    return tables;
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'Key', type: 'string', nullable: false },
        { name: 'Size', type: 'number', nullable: true },
        { name: 'LastModified', type: 'datetime', nullable: true },
        { name: 'ETag', type: 'string', nullable: true },
      ],
      primaryKeys: ['Key'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.client) throw new Error('Not connected');
    
    // If table looks like a file path, get that specific object
    if (table.includes('.')) {
      try {
        const res = await this.client.send(new GetObjectCommand({
          Bucket: this.bucket,
          Key: table,
        }));
        const body = await res.Body?.transformToString() || '';
        return [createEvent({ op: 'S', table, after: { Key: table, Body: body, ContentType: res.ContentType }, watermark: table })];
      } catch {
        return [];
      }
    }
    
    // Otherwise list objects in prefix
    const res = await this.client.send(new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: table,
    }));
    return (res.Contents || []).map(obj =>
      createEvent({ op: 'S', table, after: { Key: obj.Key, Size: obj.Size, LastModified: obj.LastModified, ETag: obj.ETag }, watermark: obj.Key || '' })
    );
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
