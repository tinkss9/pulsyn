// Kafka Connector — event streaming source/target
// npm install kafkajs

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let Kafka: any;
try { Kafka = require('kafkajs').Kafka; } catch {}

@registerSource('kafka')
export class KafkaConnector extends BaseConnector {
  private client: any = null;
  private consumer: any = null;
  private producer: any = null;
  private running = false;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'kafka', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!Kafka) throw new Error('kafkajs not installed');
    this.client = new Kafka({ clientId: 'pulsyn', brokers: (config.host || '').split(',') });
    this.producer = this.client.producer();
    await this.producer.connect();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    if (this.producer) { await this.producer.disconnect(); }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> { try { await this.producer?.metadata(); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    const admin = this.client.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    await admin.disconnect();
    return topics;
  }

  async getTableSchema(): Promise<TableSchema> { return { name: 'topic', columns: [{ name: 'key', type: 'bytes', nullable: true }, { name: 'value', type: 'bytes', nullable: true }], primaryKey: ['key'] }; }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.consumer = this.client.consumer({ groupId: 'pulsyn-cdc' });
    await this.consumer.connect();
    const topics = await this.getTables();
    await this.consumer.subscribe({ topics, fromBeginning: false });
    this.running = true;
    await this.consumer.run({
      eachMessage: async ({ topic, message }: any) => {
        if (!this.running) return;
        callback({
          id: `kafka-${message.offset}`,
          operation: 'INSERT',
          table: topic,
          timestamp: new Date(),
          data: { key: message.key?.toString(), value: message.value?.toString() },
          lsn: message.offset,
        });
      },
    });
  }

  async stopCDC(): Promise<void> {
    this.running = false;
    if (this.consumer) { await this.consumer.disconnect(); this.consumer = null; }
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    let written = 0;
    for (const event of events) {
      await this.producer.send({ topic: table, messages: [{ key: event.watermark, value: JSON.stringify(event.after) }] });
      written++;
    }
    return written;
  }
}
