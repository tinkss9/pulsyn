// @ts-nocheck
import { MongoClient, Db, Collection, BulkWriteOptions } from 'mongodb';
import { BaseConnector } from './base';
import { registerTarget } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerTarget('mongodb')
export class MongoDBTargetConnector extends BaseConnector {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 'mongodb', config, options?.batchSize || 10000);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const uri = (config as any).uri || this.buildUri(config);

    this.client = new MongoClient(uri, {
      maxPoolSize: 20,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
    });

    await this.client.connect();
    this.db = this.client.db(config.database || 'pulsyn');
    await this.db.command({ ping: 1 });
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.db) return false;
      await this.db.command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.db) throw new Error('Not connected');
    const collections = await this.db.listCollections().toArray();
    return collections.map((c) => c.name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.db) throw new Error('Not connected');
    // Sample documents to infer schema
    const docs = await this.db.collection(table).find().limit(100).toArray();
    const fieldMap = new Map<string, string>();
    for (const doc of docs) {
      for (const [k, v] of Object.entries(doc)) {
        if (!fieldMap.has(k)) fieldMap.set(k, typeof v);
      }
    }
    return {
      table,
      columns: Array.from(fieldMap.entries()).map(([name, type]) => ({
        name, type, nullable: true, defaultValue: null,
      })),
      primaryKeys: ['_id'],
    };
  }

  async startCDC(_cb: (event: CDCEvent) => void): Promise<void> {
    throw new Error('MongoDB target does not support CDC read — use change streams on source');
  }
  async stopCDC(): Promise<void> {}

  async createTableIfNeeded(table: string, schema: Record<string, any>): Promise<void> {
    if (!this.db) throw new Error('Not connected');
    const collections = await this.db.listCollections({ name: table }).toArray();
    if (collections.length === 0) {
      await this.db.createCollection(table);
      // Create indexes for common key patterns
      const indexFields = Object.keys(schema).filter((k) =>
        k.toLowerCase().includes('id') || k.toLowerCase() === '_id'
      );
      if (indexFields.length > 0 && indexFields[0] !== '_id') {
        await this.db.collection(table).createIndex(
          { [indexFields[0]]: 1 },
          { unique: true, background: true }
        );
      }
    }
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    if (!this.db) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    const collection = this.db.collection(table);
    let written = 0;

    for (let i = 0; i < rows.length; i += this.batchSize) {
      const batch = rows.slice(i, i + this.batchSize);
      const docs = batch.map((row) => this.serializeDoc(row));

      try {
        const result = await collection.insertMany(docs, {
          ordered: false, // Continue on duplicate key errors
        });
        written += result.insertedCount;
      } catch (error: any) {
        // Handle duplicate key errors gracefully — count successful inserts
        if (error.code === 11000 && error.result) {
          written += error.result.nInserted || 0;
        } else {
          throw new Error(`MongoDB insertMany failed: ${error.message}`);
        }
      }
    }
    return written;
  }

  async merge(table: string, events: UnifiedChangeEvent[], keyColumns: string[]): Promise<number> {
    if (!this.db) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    const collection = this.db.collection(table);
    let merged = 0;

    for (let i = 0; i < rows.length; i += this.batchSize) {
      const batch = rows.slice(i, i + this.batchSize);

      const operations = batch.map((row) => {
        const filter: Record<string, any> = {};
        for (const key of keyColumns) {
          filter[key] = row[key];
        }
        const doc = this.serializeDoc(row);
        return {
          updateOne: {
            filter,
            update: { $set: doc },
            upsert: true,
          },
        };
      });

      const result = await collection.bulkWrite(operations, {
        ordered: false,
      });
      merged += (result.upsertedCount || 0) + (result.modifiedCount || 0) + (result.insertedCount || 0);
    }
    return merged;
  }

  private serializeDoc(row: Record<string, any>): Record<string, any> {
    const doc: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      if (v instanceof Date) doc[k] = v;
      else if (v === undefined) doc[k] = null;
      else doc[k] = v;
    }
    return doc;
  }

  private buildUri(config: DatabaseConfig): string {
    const auth = config.username ? `${encodeURIComponent(config.username)}:${encodeURIComponent(config.password || '')}@` : '';
    const host = config.host || 'localhost';
    const port = config.port || 27017;
    const ssl = config.ssl ? '?tls=true&tlsAllowInvalidCertificates=true' : '';
    return `mongodb://${auth}${host}:${port}/${config.database || 'pulsyn'}${ssl}`;
  }
}

