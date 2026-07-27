// @ts-nocheck
import { Db, Collection, Document } from 'mongodb';
import { MongoDBConnector } from './mongodb';
import { registerTarget } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, WriteBatchResult, MergeResult } from '../types';

@registerTarget('mongodb')
export class MongoDBTargetConnector extends MongoDBConnector {
  private createdCollections = new Set<string>();

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'mongodb', config);
  }

  private async ensureCollection(collection: string): Promise<Collection> {
    const db = this.getDb();
    if (!db) throw new Error('Not connected');
    if (!this.createdCollections.has(collection)) {
      await db.createCollection(collection).catch(() => {});
      this.createdCollections.add(collection);
    }
    return db.collection(collection);
  }

  async createTableIfNeeded(table: string, _schema: any): Promise<{ created: boolean }> {
    const db = this.getDb();
    if (!db) throw new Error('Not connected');
    const collections = await db.listCollections({ name: table }).toArray();
    if (collections.length === 0) {
      await db.createCollection(table);
      this.createdCollections.add(table);
      return { created: true };
    }
    return { created: false };
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<WriteBatchResult> {
    const collection = await this.ensureCollection(table);
    let inserted = 0, updated = 0, deleted = 0, failed = 0;
    const failedRecords: any[] = [];

    for (const event of events) {
      try {
        switch (event.op) {
          case 'I':
          case 'S':
            if (event.after) {
              await collection.updateOne(
                { _id: event.after._id || event.after.id },
                { $set: event.after },
                { upsert: true },
              );
              inserted++;
            }
            break;
          case 'U':
            if (event.after) {
              const key = event.after._id || event.after.id;
              if (key) {
                await collection.updateOne({ _id: key }, { $set: event.after }, { upsert: true });
                updated++;
              } else {
                await collection.insertOne(event.after);
                inserted++;
              }
            }
            break;
          case 'D':
            if (event.before) {
              const delKey = event.before._id || event.before.id;
              if (delKey) {
                await collection.deleteOne({ _id: delKey });
                deleted++;
              }
            }
            break;
        }
      } catch (err) {
        failed++;
        failedRecords.push({ event, error: (err as Error).message });
      }
    }
    return { inserted, updated, deleted, errors: failed, merged: 0, failedRecords };
  }

  async merge(table: string, events: UnifiedChangeEvent[], _keyColumns: string[]): Promise<MergeResult> {
    const collection = await this.ensureCollection(table);
    let upserted = 0, updated = 0, deleted = 0, failed = 0;

    for (const event of events) {
      try {
        if (event.op === 'D') {
          if (event.before) {
            const delKey = event.before._id || event.before.id;
            if (delKey) await collection.deleteOne({ _id: delKey });
            deleted++;
          }
        } else if (event.after) {
          const key = event.after._id || event.after.id;
          if (key) {
            const result = await collection.updateOne(
              { _id: key }, { $set: event.after }, { upsert: true },
            );
            if (result.upsertedCount > 0) upserted++;
            else updated++;
          }
        }
      } catch {
        failed++;
      }
    }
    return { upserted, updated, deleted, failed };
  }
}
