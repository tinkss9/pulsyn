// MongoDB Connector — DMS-inspired with change streams
// Ported from DMS Replicate src/extractors/connectors/mongodb_connector.py

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let mongodb: any;
try { mongodb = require('mongodb'); } catch {}

@registerSource('mongodb')
export class MongoDBConnector extends BaseConnector {
  private client: any = null;
  private db: any = null;
  private changeStream: any = null;
  private running = false;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'mongodb', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!mongodb) throw new Error('mongodb not installed. Run: npm install mongodb');
    const uri = config.host.startsWith('mongodb')
      ? config.host
      : `mongodb://${config.user}:${config.password}@${config.host}:${config.port || 27017}/${config.database}`;
    this.client = new mongodb.MongoClient(uri, { serverSelectionTimeoutMS: 30000 });
    await this.client.connect();
    this.db = this.client.db(config.database);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    if (this.client) { await this.client.close(); this.client = null; this.db = null; }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.db().admin().ping();
      return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const collections = await this.db.listCollections().toArray();
    return collections.map((c: any) => c.name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    // Sample one document to infer schema
    const sample = await this.db.collection(table).findOne();
    if (!sample) return { name: table, columns: [], primaryKey: ['_id'] };
    const columns = Object.keys(sample).map(key => ({
      name: key,
      type: typeof sample[key] === 'object' ? 'object' : typeof sample[key],
      nullable: sample[key] === null,
    }));
    return { name: table, columns, primaryKey: ['_id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const docs = await this.db.collection(table).find().limit(this.batchSize).toArray();
    return docs.map((doc: any) => {
      const { _id, ...data } = doc;
      return createEvent({ op: 'S', table, after: data, watermark: String(_id), sourceMetadata: { pk: String(_id), source: 'mongodb' } });
    });
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    let cursor;
    if (watermark) {
      cursor = this.db.collection(table).find({ _id: { $gt: new mongodb.ObjectId(watermark) } }).limit(this.batchSize);
    } else {
      cursor = this.db.collection(table).find().limit(this.batchSize);
    }
    const docs = await cursor.toArray();
    return docs.map((doc: any) => {
      const { _id, ...data } = doc;
      return createEvent({ op: 'I', table, after: data, watermark: String(_id), sourceMetadata: { pk: String(_id), source: 'mongodb' } });
    });
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.db) throw new Error('Not connected');
    this.running = true;

    // Use MongoDB change streams (requires replica set)
    this.changeStream = this.db.watch([], { fullDocument: 'updateLookup' });
    this.changeStream.on('change', (change: any) => {
      if (!this.running) return;
      const opMap: Record<string, string> = { insert: 'INSERT', update: 'UPDATE', delete: 'DELETE', replace: 'UPDATE' };
      callback({
        id: change._id._data || String(Date.now()),
        operation: (opMap[change.operationType] || 'INSERT') as any,
        table: change.ns?.coll || 'unknown',
        timestamp: new Date(),
        data: change.fullDocument || change.documentKey || {},
        oldData: change.fullDocumentBeforeChange || undefined,
        lsn: change._id._data || String(Date.now()),
      });
    });
  }

  async stopCDC(): Promise<void> {
    this.running = false;
    if (this.changeStream) { await this.changeStream.close(); this.changeStream = null; }
  }
}
