// @ts-nocheck
import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import * as parquet from 'parquetjs';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { BaseConnector } from './base';
import { registerTarget } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerTarget('s3-parquet')
export class S3ParquetTargetConnector extends BaseConnector {
  private s3: S3Client | null = null;
  private bucket: string = '';
  private prefix: string = '';
  private partitionBy: string = 'date'; // date partition by default

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 's3-parquet', config, options?.batchSize || 50000);
    if (options?.partitionBy) this.partitionBy = options.partitionBy;
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.bucket = (config as any).bucket || config.database || '';
    this.prefix = (config as any).prefix || '';

    this.s3 = new S3Client({
      region: (config as any).region || 'us-east-1',
      credentials: config.username ? {
        accessKeyId: config.username,
        secretAccessKey: config.password || '',
      } : undefined, // falls back to default credential chain
    });

    // Verify bucket access
    await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.s3 = null;
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.s3) return false;
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    // S3 doesn't have tables — return empty
    return [];
  }

  async getTableSchema(_table: string): Promise<TableSchema> {
    return { table: _table, columns: [], primaryKeys: [] };
  }

  async startCDC(_cb: (event: CDCEvent) => void): Promise<void> {
    throw new Error('S3 Parquet target does not support CDC read');
  }
  async stopCDC(): Promise<void> {}

  async createTableIfNeeded(_table: string, _schema: Record<string, any>): Promise<void> {
    // No-op for S3 — directories are created implicitly
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    if (!this.s3) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    let written = 0;

    for (let i = 0; i < rows.length; i += this.batchSize) {
      const batch = rows.slice(i, i + this.batchSize);
      const tmpFile = path.join(os.tmpdir(), `pulsyn_s3_${this.id}_${Date.now()}.parquet`);

      try {
        // Build parquet schema from first row
        const schema = this.buildParquetSchema(batch[0]);
        const writer = await parquet.ParquetWriter.openFile(schema, tmpFile);

        for (const row of batch) {
          await writer.appendRow(this.sanitizeRow(row));
        }
        await writer.close();

        // Generate partitioned S3 key
        const partition = this.getPartitionPath();
        const fileName = `${table}_${Date.now()}_${i}.parquet`;
        const s3Key = [this.prefix, table, partition, fileName].filter(Boolean).join('/');

        const fileBuffer = fs.readFileSync(tmpFile);
        await this.s3!.send(new PutObjectCommand({
          Bucket: this.bucket,
          Key: s3Key,
          Body: fileBuffer,
          ContentType: 'application/x-parquet',
          Metadata: {
            'pulsyn-table': table,
            'pulsyn-rows': String(batch.length),
            'pulsyn-ts': new Date().toISOString(),
          },
        }));
        written += batch.length;
      } finally {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      }
    }
    return written;
  }

  async merge(_table: string, _events: UnifiedChangeEvent[], _keyColumns: string[]): Promise<number> {
    // S3 Parquet is append-only — merge not supported
    throw new Error('S3 Parquet target is append-only. Use writeBatch instead. For merge semantics, use a lakehouse layer (Iceberg/Delta).');
  }

  private getPartitionPath(): string {
    const now = new Date();
    if (this.partitionBy === 'hour') {
      return `year=${now.getFullYear()}/month=${String(now.getMonth() + 1).padStart(2, '0')}/day=${String(now.getDate()).padStart(2, '0')}/hour=${String(now.getHours()).padStart(2, '0')}`;
    }
    // Default: date partition
    return `year=${now.getFullYear()}/month=${String(now.getMonth() + 1).padStart(2, '0')}/day=${String(now.getDate()).padStart(2, '0')}`;
  }

  private buildParquetSchema(sample: Record<string, any>): any {
    const fields: Record<string, any> = {};
    for (const [key, value] of Object.entries(sample)) {
      fields[key] = this.inferParquetType(value);
    }
    return new parquet.ParquetSchema(fields);
  }

  private inferParquetType(value: any): any {
    if (value === null || value === undefined) return { type: 'UTF8', optional: true };
    if (typeof value === 'number') {
      return Number.isInteger(value) ? { type: 'INT64', optional: true } : { type: 'DOUBLE', optional: true };
    }
    if (typeof value === 'boolean') return { type: 'BOOLEAN', optional: true };
    if (value instanceof Date) return { type: 'TIMESTAMP_MILLIS', optional: true };
    return { type: 'UTF8', optional: true };
  }

  private sanitizeRow(row: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      if (v instanceof Date) out[k] = v.getTime();
      else if (typeof v === 'object' && v !== null) out[k] = JSON.stringify(v);
      else out[k] = v;
    }
    return out;
  }
}

