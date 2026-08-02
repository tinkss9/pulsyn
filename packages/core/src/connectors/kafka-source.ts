// @ts-nocheck
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('kafka')
export class KafkaSourceConnector extends BaseConnector {
  private kafka: Kafka | null = null;
  private consumer: Consumer | null = null;
  private topicPrefix: string = '';
  private groupId: string = 'pulsyn-consumer';

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 'kafka', config, options?.batchSize || 10000);
    if (options?.topicPrefix) this.topicPrefix = options.topicPrefix;
    if (options?.groupId) this.groupId = options.groupId;
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const brokers = (config.host || 'localhost:9092').split(',').map((b) => b.trim());

    this.kafka = new Kafka({
      clientId: `pulsyn-source-${this.id}`,
      brokers,
      ssl: config.ssl ? true : undefined,
      sasl: config.username ? {
        mechanism: (config as any).saslMechanism || 'plain',
        username: config.username,
        password: config.password || '',
      } : undefined,
      retry: { initialRetryTime: 300, retries: 5 },
    });

    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.consumer = null;
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
    return topics.filter(t => !t.startsWith('__')); // Filter internal topics
  }

  async getTableSchema(_table: string): Promise<TableSchema> {
    // Kafka topics are schemaless (schema registry would be separate)
    return {
      table: _table,
      columns: [
        { name: 'key', type: 'bytes', nullable: true, primaryKey: false },
        { name: 'value', type: 'bytes', nullable: true, primaryKey: false },
        { name: 'partition', type: 'number', nullable: false, primaryKey: false },
        { name: 'offset', type: 'string', nullable: false, primaryKey: true },
        { name: 'timestamp', type: 'timestamp', nullable: true, primaryKey: false },
        { name: 'headers', type: 'json', nullable: true, primaryKey: false },
      ],
      primaryKeys: ['offset'],
    };
  }

  async extractFull(table: string, opts?: { limit?: number }): Promise<UnifiedChangeEvent[]> {
    if (!this.kafka) throw new Error('Not connected');

    const topic = this.topicPrefix + table;
    const limit = opts?.limit || 1000;
    const events: UnifiedChangeEvent[] = [];

    const consumer = this.kafka.consumer({ groupId: `${this.groupId}-${Date.now()}` });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });

    let count = 0;
    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        if (count >= limit) return;
        events.push(createEvent({
          op: 'S',
          table: topic,
          after: {
            key: payload.message.key?.toString(),
            value: payload.message.value?.toString(),
            partition: payload.partition,
            offset: payload.message.offset,
            timestamp: payload.message.timestamp,
            headers: payload.message.headers,
          },
          before: null,
        }));
        count++;
      },
    });

    // Wait for messages to be consumed
    await new Promise(resolve => setTimeout(resolve, 2000));
    await consumer.disconnect();

    return events;
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    if (!this.kafka) throw new Error('Not connected');

    const topic = this.topicPrefix + table;
    const events: UnifiedChangeEvent[] = [];

    const consumer = this.kafka.consumer({ groupId: this.groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    let count = 0;
    const maxMessages = 100;

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        if (count >= maxMessages) return;
        events.push(createEvent({
          op: 'I',
          table: topic,
          after: {
            key: payload.message.key?.toString(),
            value: payload.message.value?.toString(),
            partition: payload.partition,
            offset: payload.message.offset,
            timestamp: payload.message.timestamp,
          },
          before: null,
        }));
        count++;
      },
    });

    // Wait briefly for messages
    await new Promise(resolve => setTimeout(resolve, 1000));
    await consumer.disconnect();

    return events;
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.kafka) throw new Error('Not connected');

    const topics = await this.getTables();
    this.consumer = this.kafka.consumer({ groupId: this.groupId });
    await this.consumer.connect();
    await this.consumer.subscribe({ topics, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const event: CDCEvent = {
          type: 'insert',
          table: payload.topic,
          data: {
            key: payload.message.key?.toString(),
            value: payload.message.value?.toString(),
            partition: payload.partition,
            offset: payload.message.offset,
          },
          timestamp: new Date(),
        };
        callback(event);
      },
    });
  }

  async stopCDC(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.consumer = null;
    }
  }
}
