// @ts-nocheck
import { MongoClient, Db, ChangeStream, Document } from 'mongodb';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('mongodb')
export class MongoDBConnector extends BaseConnector {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private changeStream: ChangeStream | null = null;
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const uri = (config as any).connectionString || this.buildUri(config);
      this.client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      await this.client.connect();
      this.db = this.client.db(config.database);
      await this.db.command({ ping: 1 });
      this.connected = true;
    } catch (error) {
      throw new Error(`MongoDB connection failed: ${(error as Error).message}`);
    }
  }

  private buildUri(config: DatabaseConfig): string {
    const user = config.username || (config as any).user;
    const auth = user ? `${user}:${config.password}@` : '';
    const host = `${config.host}:${config.port || 27017}`;
    const authSource = (config as any).authSource || (user ? 'admin' : '');
    const opts = [
      config.ssl ? 'tls=true&tlsAllowInvalidCertificates=true' : '',
      authSource ? `authSource=${authSource}` : '',
    ].filter(Boolean).join('&');
    return `mongodb://${auth}${host}/${config.database}${opts ? '?' + opts : ''}`;
  }

  async query(collection: string, filter?: any): Promise<any[]> {
    if (!this.db) throw new Error('Not connected');
    return this.db.collection(collection).find(filter || {}).toArray();
  }

  getDb(): Db | null {
    return this.db;
  }

  async disconnect(): Promise<void> {
    try {
      await this.stopCDC();
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
      }
      this.connected = false;
    } catch (error) {
      throw new Error(`MongoDB disconnect failed: ${(error as Error).message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.db) return false;
      const result = await this.db.command({ ping: 1 });
      return result.ok === 1;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.db) throw new Error('Not connected');
    const collections = await this.db.listCollections().toArray();
    return collections.filter((c) => c.type === 'collection').map((c) => c.name).sort();
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.db) throw new Error('Not connected');
    const sample = await this.db.collection(table).find().limit(100).toArray();
    const fieldTypes = new Map<string, Set<string>>();

    for (const doc of sample) {
      for (const [key, value] of Object.entries(doc)) {
        if (!fieldTypes.has(key)) fieldTypes.set(key, new Set());
        fieldTypes.get(key)!.add(typeof value);
      }
    }

    const columns = Array.from(fieldTypes.entries()).map(([name, types]) => ({
      name,
      type: Array.from(types).join('|'),
      nullable: sample.some((d) => d[name] === null || d[name] === undefined),
      defaultValue: null,
    }));

    return { name: table, table, columns, primaryKey: ['_id'], primaryKeys: ['_id'] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.db) throw new Error('Not connected');
    this.cdcActive = true;
    this.changeStream = this.db.watch([], {
      fullDocument: 'updateLookup',
      fullDocumentBeforeChange: 'whenAvailable',
    });

    this.changeStream.on('change', (change: Document) => {
      if (!this.cdcActive) return;
      let op: 'I' | 'U' | 'D';
      let before: Record<string, any> | null = null;
      let after: Record<string, any> | null = null;

      switch (change.operationType) {
        case 'insert':
          op = 'I'; after = change.fullDocument || null; break;
        case 'update':
        case 'replace':
          op = 'U';
          before = change.fullDocumentBeforeChange || null;
          after = change.fullDocument || null;
          break;
        case 'delete':
          op = 'D';
          before = change.fullDocumentBeforeChange || { _id: change.documentKey?._id };
          break;
        default: return;
      }

      callback({ op, table: change.ns?.coll || 'unknown', before, after, ts: new Date() });
    });

    this.changeStream.on('error', () => {
      if (this.cdcActive) setTimeout(() => this.startCDC(callback), 5000);
    });
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.changeStream) {
      await this.changeStream.close();
      this.changeStream = null;
    }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.db) throw new Error('Not connected');
    const events: UnifiedChangeEvent[] = [];
    let skip = 0;

    while (true) {
      const docs = await this.db.collection(table)
        .find().sort({ _id: 1 }).skip(skip).limit(this.batchSize).toArray();
      if (docs.length === 0) break;
      for (const doc of docs) {
        events.push(createEvent({
          op: 'S', table,
          after: doc,
          before: null,
          sourceMetadata: { source: 'mongodb', pk: doc._id?.toString() || null },
        }));
      }
      skip += docs.length;
      if (docs.length < this.batchSize) break;
    }
    return events;
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    if (!this.db) throw new Error('Not connected');
    const wmCol = opts?.watermarkColumn || this.config.watermarkColumn || 'updatedAt';
    const watermark = opts?.watermarkValue || null;
    const events: UnifiedChangeEvent[] = [];
    const filter = watermark ? { [wmCol]: { $gt: new Date(watermark) } } : {};
    const docs = await this.db.collection(table)
      .find(filter).sort({ [wmCol]: 1 }).limit(this.batchSize).toArray();
    for (const doc of docs) {
      events.push(createEvent({
        op: 'I', table,
        after: doc,
        before: null,
        sourceMetadata: { source: 'mongodb', pk: doc[wmCol]?.toISOString() || null },
      }));
    }
    return events;
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.db) throw new Error('Not connected');
    return await this.db.collection(table).estimatedDocumentCount();
  }

  async getPrimaryKey(): Promise<string> {
    return '_id';
  }
}
