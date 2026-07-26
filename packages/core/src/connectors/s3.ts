// S3 Connector — Amazon S3 object storage source/target
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let S3Client: any, ListObjectsV2Command: any, GetObjectCommand: any;
try {
  const sdk = require('@aws-sdk/client-s3');
  S3Client = sdk.S3Client; ListObjectsV2Command = sdk.ListObjectsV2Command; GetObjectCommand = sdk.GetObjectCommand;
} catch {}

@registerSource('s3')
export class S3Connector extends BaseConnector {
  private client: any = null;
  private bucket: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 's3', config);
    this.bucket = (config as any).bucket || config.database || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!S3Client) throw new Error('@aws-sdk/client-s3 not installed');
    this.client = new S3Client({
      region: (config as any).region || 'us-east-1',
      credentials: { accessKeyId: config.user, secretAccessKey: config.password },
    });
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      await this.client.send(new ListObjectsV2Command({ Bucket: this.bucket, MaxKeys: 1 }));
      return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['objects']; }

  async getTableSchema(): Promise<TableSchema> {
    return {
      name: 'objects',
      columns: [
        { name: 'Key', type: 'string', nullable: false },
        { name: 'Size', type: 'number', nullable: true },
        { name: 'LastModified', type: 'datetime', nullable: true },
        { name: 'ETag', type: 'string', nullable: true },
      ],
      primaryKey: ['Key'],
    };
  }

  async extractFull(): Promise<UnifiedChangeEvent[]> {
    const result = await this.client.send(new ListObjectsV2Command({ Bucket: this.bucket, MaxKeys: this.batchSize }));
    return (result.Contents || []).map((obj: any) =>
      createEvent({ op: 'S', table: 'objects', after: obj, watermark: obj.Key })
    );
  }

  async startCDC(): Promise<void> { throw new Error('S3 CDC requires S3 Event Notifications — use polling'); }
  async stopCDC(): Promise<void> {}

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    let written = 0;
    for (const event of events) {
      if (event.after?.Key) {
        // Upload object
        await this.client.send(new (require('@aws-sdk/client-s3').PutObjectCommand)({
          Bucket: this.bucket,
          Key: event.after.Key,
          Body: JSON.stringify(event.after),
        }));
        written++;
      }
    }
    return written;
  }
}
