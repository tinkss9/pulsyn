// @ts-nocheck
import { Kafka, Consumer, Admin } from 'kafkajs';
type EachMessagePayload = { topic: string; partition: number; message: any };
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('kafka')
export class KafkaConnector extends BaseConnector {
  private kafka: Kafka | null = null;
  private consumer: Consumer | null = null;
  private admin: Admin | null = null;
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const brokers = (config.host || 'localhost:9092').split(',');
      this.kafka = new Kafka({
        clientId: `pulsyn-${this.id}`,
        brokers,
        ssl: config.ssl ? true : undefined,
        sasl: config.username ? {
          mechanism: 'plain',
          username: config.username,
          password: config.password || '',
        } : undefined,
      });
      this.admin = this.kafka.admin();
      await this.admin.connect();
      this.connected = true;
    } catch (error) {
      throw new Error(`Kafka connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.stopCDC();
      if (this.admin) { await this.admin.disconnect(); this.admin = null; }
      this.kafka = null;
      this.connected = false;
    } catch (error) {
      throw new Error(`Kafka disconnect failed: ${(error as Error).message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.admin) return false;
      await this.admin.listTopics();
      return true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.admin) throw new Error('Not connected');
    try {
      const topics = await this.admin.listTopics();
      return topics.filter((t) => !t.startsWith('__'));
    } catch (error) {
      throw new Error(`Failed to list topics: ${(error as Error).message}`);
    }
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.admin) throw new Error('Not connected');
    try {
      const metadata = await this.admin.fetchTopicMetadata({ topics: [table] });
      const topic = metadata.topics[0];
      return {
        table,
        columns: [
          { name: 'key', type: 'string', nullable: true, defaultValue: undefined },
          { name: 'value', type: 'json', nullable: false, defaultValue: undefined },
          { name: 'partition', type: 'integer', nullable: false, defaultValue: undefined },
          { name: 'offset', type: 'bigint', nullable: false, defaultValue: undefined },
          { name: 'timestamp', type: 'timestamp', nullable: true, defaultValue: undefined },
        ],
        primaryKey: ['partition', 'offset'],
      };
    } catch (error) {
      throw new Error(`Failed to get schema for ${table}: ${(error as Error).message}`);
    }
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.kafka) throw new Error('Not connected');
    try {
      const groupId = (this.config as any).consumerGroup || `pulsyn-cdc-${this.id}`;
      this.consumer = this.kafka.consumer({ groupId });
      await this.consumer.connect();

      const topics = await this.getTables();
      const targetTopics = (this.config as any).topics || topics.slice(0, 5);
      await this.consumer.subscribe({ topics: targetTopics, fromBeginning: false });

      this.cdcActive = true;
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
          if (!this.cdcActive) return;
          const value = message.value ? JSON.parse(message.value.toString()) : undefined;
          const key = message.key?.toString() || null;
          callback({
            op: 'I', name: topic,
            before: undefined,
            after: { key, value, partition, offset: message.offset },
            ts: message.timestamp ? new Date(parseInt(message.timestamp)) : new Date(),
          });
        },
      });
    } catch (error) {
      throw new Error(`Failed to start CDC: ${(error as Error).message}`);
    }
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.consumer) {
      try { await this.consumer.disconnect(); } catch { /* ignore */ }
      this.consumer = null;
    }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.kafka) throw new Error('Not connected');
    const events: UnifiedChangeEvent[] = [];
    const groupId = `pulsyn-extract-${this.id}-${Date.now()}`;
    const consumer = this.kafka.consumer({ groupId });

    try {
      await consumer.connect();
      await consumer.subscribe({ topics: [table], fromBeginning: true });

      let done = false;
      const timeout = setTimeout(() => { done = true; }, 30000);

      await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
          if (done) return;
          const value = message.value ? JSON.parse(message.value.toString()) : undefined;
          const key = message.key?.toString() || null;
          events.push(createEvent({
            op: 'I',
            name: topic,
            data: { key, value },
            watermark: String(key || ''),
          }));
          if (events.length >= this.batchSize * 10) done = true;
        },
      });

      // Wait for consumption or timeout
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (done) { clearInterval(check); clearTimeout(timeout); resolve(); }
        }, 500);
      });
      await consumer.disconnect();
    } catch (error) {
      try { await consumer.disconnect(); } catch { /* ignore */ }
      throw new Error(`Failed to extract from ${table}: ${(error as Error).message}`);
    }
    return events;
  }

  async extractIncremental(name: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.kafka) throw new Error('Not connected');
    const events: UnifiedChangeEvent[] = [];
    const groupId = `pulsyn-incr-${this.id}-${Date.now()}`;
    const consumer = this.kafka.consumer({ groupId });

    try {
      await consumer.connect();
      await consumer.subscribe({ topics: [table], fromBeginning: false });

      if (watermark) {
        const admin = this.kafka.admin();
        await admin.connect();
        const offsets = await admin.fetchTopicOffsets(table);
        await admin.disconnect();
        // Seek to watermark offset on each partition
        for (const p of offsets) {
          const seekOffset = Math.max(parseInt(watermark), parseInt(p.low));
          consumer.seek({ topic: table, partition: p.partition, offset: seekOffset.toString() });
        }
      }

      let done = false;
      setTimeout(() => { done = true; }, 10000);

      await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
          if (done) return;
          const value = message.value ? JSON.parse(message.value.toString()) : undefined;
          events.push(createEvent({
            op: 'I',
            name: topic,
            data: { key: message.key?.toString(), value },
            watermark: message.key?.toString() || '',
          }));
          if (events.length >= this.batchSize) done = true;
        },
      });

      await new Promise((r) => setTimeout(r, 10000));
      await consumer.disconnect();
    } catch (error) {
      try { await consumer.disconnect(); } catch { /* ignore */ }
      throw new Error(`Incremental extract failed: ${(error as Error).message}`);
    }
    return events;
  }
}






