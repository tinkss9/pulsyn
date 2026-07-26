// @ts-nocheck
// @vitest-environment node
// Integration test: S3 connector against LocalStack (localhost:4566)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { skipIfNoDocker, getTestConfig, waitForService } from './docker-harness';
import { ConnectorRegistry } from '../../connectors/registry';
import '../../connectors/s3';
import type { UnifiedChangeEvent } from '../../events';

describe('S3 LocalStack Integration', () => {
  let connector: any;
  const testBucket = 'integration-test-bucket';
  const config = getTestConfig('localstack');

  beforeAll(async () => {
    skipIfNoDocker('localstack');
    await waitForService(config.host, config.port, 15000);

    const s3Config = {
      ...config,
      bucket: testBucket,
      accessKeyId: 'test',
      secretAccessKey: 'test',
      forcePathStyle: true,
    };
    connector = ConnectorRegistry.getSource('s3', 'test-s3', s3Config);
    await connector.connect(s3Config);

    // Create test bucket and upload test files
    try {
      const { S3Client, CreateBucketCommand, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const client = new S3Client({
        region: config.region,
        endpoint: config.endpoint,
        forcePathStyle: true,
        credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
      });
      await client.send(new CreateBucketCommand({ Bucket: testBucket }));
      await client.send(new PutObjectCommand({
        Bucket: testBucket, Key: 'data/users.csv',
        Body: 'id,name,email\n1,Alice,alice@test.com\n2,Bob,bob@test.com\n3,Charlie,charlie@test.com',
      }));
      await client.send(new PutObjectCommand({
        Bucket: testBucket, Key: 'data/orders.json',
        Body: JSON.stringify([
          { id: 1, product: 'Widget', amount: 100 },
          { id: 2, product: 'Gizmo', amount: 200 },
        ]),
      }));
      await client.send(new PutObjectCommand({
        Bucket: testBucket, Key: 'data/empty.csv', Body: '',
      }));
    } catch (err) {
      console.warn('Failed to setup S3 test data:', err);
    }
  });

  afterAll(async () => {
    if (connector?.isConnected()) {
      await connector.disconnect();
    }
    // Cleanup bucket
    try {
      const { S3Client, DeleteObjectCommand, DeleteBucketCommand, ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      const client = new S3Client({
        region: config.region, endpoint: config.endpoint, forcePathStyle: true,
        credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
      });
      const list = await client.send(new ListObjectsV2Command({ Bucket: testBucket }));
      for (const obj of list.Contents || []) {
        await client.send(new DeleteObjectCommand({ Bucket: testBucket, Key: obj.Key }));
      }
      await client.send(new DeleteBucketCommand({ Bucket: testBucket }));
    } catch { /* best effort */ }
  });

  it('should connect successfully', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('should list objects as tables', async () => {
    const tables = await connector.getTables();
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBeGreaterThanOrEqual(2);
  });

  it('should extractFull from CSV file', async () => {
    const events: UnifiedChangeEvent[] = await connector.extractFull('data/users.csv');
    expect(events.length).toBeGreaterThanOrEqual(3);
    expect(events[0].op).toBe('S');
    expect(events[0].after?.name).toBeDefined();
  });

  it('should extractFull from JSON file', async () => {
    const events: UnifiedChangeEvent[] = await connector.extractFull('data/orders.json');
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events[0].after?.product).toBeDefined();
  });

  it('should handle empty file', async () => {
    const events = await connector.extractFull('data/empty.csv');
    expect(events).toEqual([]);
  });

  it('should extractIncremental with watermark', async () => {
    const watermark = new Date(Date.now() - 86400000).toISOString();
    const events = await connector.extractIncremental('data/users.csv', watermark);
    expect(Array.isArray(events)).toBe(true);
  });
});

