// Google Cloud Storage Connector — source/target
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let Storage: any;
try { Storage = require('@google-cloud/storage').Storage; } catch {}

@registerSource('gcs')
export class GCSConnector extends BaseConnector {
  private client: any = null;
  private bucketName: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'gcs', config);
    this.bucketName = (config as any).bucket || config.database || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!Storage) throw new Error('@google-cloud/storage not installed');
    this.client = new Storage({
      projectId: config.database,
      credentials: { client_email: config.user, private_key: config.password },
    });
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const bucket = this.client.bucket(this.bucketName);
      await bucket.exists();
      return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['objects']; }

  async getTableSchema(): Promise<TableSchema> {
    return {
      name: 'objects',
      columns: [
        { name: 'name', type: 'string', nullable: false },
        { name: 'size', type: 'number', nullable: true },
        { name: 'updated', type: 'datetime', nullable: true },
        { name: 'contentType', type: 'string', nullable: true },
      ],
      primaryKey: ['name'],
    };
  }

  async extractFull(): Promise<UnifiedChangeEvent[]> {
    const bucket = this.client.bucket(this.bucketName);
    const [files] = await bucket.getFiles({ maxResults: this.batchSize });
    return files.map((file: any) =>
      createEvent({
        op: 'S',
        table: 'objects',
        after: { name: file.name, size: file.metadata.size, updated: file.metadata.updated, contentType: file.metadata.contentType },
        watermark: file.name,
      })
    );
  }

  async startCDC(): Promise<void> { throw new Error('GCS CDC requires Cloud Functions — use polling'); }
  async stopCDC(): Promise<void> {}
}
