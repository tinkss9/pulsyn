// @ts-nocheck
import { Kafka, Producer, CompressionTypes, RecordMetadata } from 'kafkajs';
import { BaseConnector } from './base';
import { registerTarget } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerTarget('kafka')
export class KafkaTargetConnector extends BaseConnector {
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private compression: CompressionTypes = CompressionTypes.Snappy;
  private topicPrefix: string = '';
  private acks: number = -1; // all replicas

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 'kafka', config, options?.batchSize || 10000);
    if (options?.compression) this.compression = options.compression;
    if (options?.topicPrefix) this.topicPrefix = options.topicPrefix;
    if (options?.acks !== undefined) this.acks = options.acks;
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const brokers = (config.host || 'localhost:9092').split(',').map((b) => b.trim());

    this.kafka = new Kafka({
      clientId: `pulsyn-target-${this.id}`,
      brokers,
      ssl: config.ssl ? true : undefined,
      sasl: config.username ? {
        mechanism: (config as any).saslMechanism || 'plain',
        username: config.username,
        password: config.password || '',
      } : undefined,
      retry: { initialRetryTime: 300, retries: 5 },
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 60000,
      maxInFlightRequests: 5,
    });
    await this.producer.connect();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
      this.producer = null;
    }
    this.kafka = null;
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.kafka) return false;
      const admin = this.kafka.admin();
      await admin.connect();
      await admin.listTopics();
      await admin.disconnect();
      return true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.kafka) throw new Error('Not connected');
    const admin = this.kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    await admin.disconnect();
    return topics;
  }

  async getTableSchema(_table: string): Promise<TableSchema> {
    // Kafka topics are schemaless (schema registry would be separate)
    return { table: _table, columns: [], primaryKeys: [] };
  }

  async startCDC(_cb: (event: CDCEvent) => void): Promise<void> {
    throw new Error('Kafka target does not support CDC read — use the source connector');
  }
  async stopCDC(): Promise<void> {}

  async createTableIfNeeded(_table: string, _schema: Record<string, any>): Promise<void> {
    // Topics auto-created on first produce if allowAutoTopicCreation=true
    // For explicit creation with partitions:
    if (!this.kafka) throw new Error('Not connected');
    const admin = this.kafka.admin();
    await admin.connect();
    try {
      const existing = await admin.listTopics();
      const topicName = this.getTopicName(_table);
      if (!existing.includes(topicName)) {
        await admin.createTopics({
          topics: [{ topic: topicName, numPartitions: 6, replicationFactor: 1 }],
        });
      }
    } finally {
      await admin.disconnect();
    }
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    if (!this.producer) throw new Error('Not connected');
    if (events.length === 0) return 0;

    const topicName = this.getTopicName(table);
    let written = 0;

    for (let i = 0; i < events.length; i += this.batchSize) {
      const batch = events.slice(i, i + this.batchSize);

      const messages = batch.map((event) => {
        const pk = event.sourceMetadata?.pk || this.extractPK(event);
        return {
          key: pk ? String(pk) : undefined,
          value: JSON.stringify({
            op: event.op,
            before: event.before,
            after: event.after,
            ts: event.ts.toISOString(),
            table: event.table,
            source: event.sourceMetadata,
          }),
          timestamp: String(event.ts.getTime()),
          headers: {
            'pulsyn-op': event.op,
            'pulsyn-table': table,
          },
        };
      });

      const results: RecordMetadata[] = await this.producer.send({
        topic: topicName,
        compression: this.compression,
        acks: this.acks,
        messages,
      });

      // Count successful partitions
      written += batch.length;
    }
    return written;
  }

  async merge(_table: string, _events: UnifiedChangeEvent[], _keyColumns: string[]): Promise<number> {
    // Kafka is append-only log — merge semantics handled by consumers (compacted topics)
    // We still write — topic compaction handles dedup by key
    return this.writeBatch(_table, _events);
  }

  private getTopicName(table: string): string {
    const clean = table.replace(/\./g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    return this.topicPrefix ? `${this.topicPrefix}.${clean}` : clean;
  }

  private extractPK(event: UnifiedChangeEvent): string | null {
    const data = event.after || event.before;
    if (!data) return null;
    // Try common PK field names
    for (const key of ['id', 'ID', '_id', 'pk', 'key']) {
      if (data[key] !== undefined) return String(data[key]);
    }
    return null;
  }
}

