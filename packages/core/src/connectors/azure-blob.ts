// Azure Blob Storage Connector — source/target
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let BlobServiceClient: any;
try { BlobServiceClient = require('@azure/storage-blob').BlobServiceClient; } catch {}

@registerSource('azure-blob')
export class AzureBlobConnector extends BaseConnector {
  private client: any = null;
  private containerName: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'azure-blob', config);
    this.containerName = (config as any).container || config.database || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!BlobServiceClient) throw new Error('@azure/storage-blob not installed');
    const connectionString = `DefaultEndpointsProtocol=https;AccountName=${config.user};AccountKey=${config.password};EndpointSuffix=core.windows.net`;
    this.client = BlobServiceClient.fromConnectionString(connectionString);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const container = this.client.getContainerClient(this.containerName);
      await container.getProperties();
      return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['blobs']; }

  async getTableSchema(): Promise<TableSchema> {
    return {
      name: 'blobs',
      columns: [
        { name: 'name', type: 'string', nullable: false },
        { name: 'contentLength', type: 'number', nullable: true },
        { name: 'lastModified', type: 'datetime', nullable: true },
        { name: 'etag', type: 'string', nullable: true },
      ],
      primaryKey: ['name'],
    };
  }

  async extractFull(): Promise<UnifiedChangeEvent[]> {
    const container = this.client.getContainerClient(this.containerName);
    const blobs: any[] = [];
    for await (const blob of container.listBlobsFlat()) {
      blobs.push(blob);
      if (blobs.length >= this.batchSize) break;
    }
    return blobs.map((blob: any) =>
      createEvent({ op: 'S', table: 'blobs', after: { name: blob.name, ...blob.properties }, watermark: blob.name })
    );
  }

  async startCDC(): Promise<void> { throw new Error('Azure Blob CDC requires Event Grid — use polling'); }
  async stopCDC(): Promise<void> {}
}
