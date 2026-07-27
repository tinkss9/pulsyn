// @ts-nocheck
// @vitest-environment node
// Integration test: S3 connector against MinIO (localhost:4566)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { skipIfNoDocker, getTestConfig, waitForService } from './docker-harness';
import { ConnectorRegistry } from '../../connectors/registry';
import '../../connectors/s3';
import type { UnifiedChangeEvent } from '../../events';

describe('S3 LocalStack Integration', () => {
  let connector: any;
  let s3Client: any;
  const testBucket = 'integration-test-bucket';
  const config = getTestConfig('localstack');

  beforeAll(async () => {
    skipIfNoDocker('localstack');
    await waitForService(config.host, config.port, 15000);

    // Create S3 client and bucket BEFORE connecting connector
    const { S3Client, CreateBucketCommand, PutObjectCommand } = await import('@aws-sdk/client-s3');
    s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId: config.accessKeyId || 'test', secretAccessKey: config.secretAccessKey || 'testtest' },
    });

    // Create bucket
    await s3Client.send(new CreateBucketCommand({ Bucket: testBucket }));

    // Upload test files
    await s3Client.send(new PutObjectCommand({
      Bucket: testBucket, Key: 'data/users.csv',
      Body: 'id,name,email\n1,Alice,alice@test.com\n2,Bob,bob@test.com\n3,Charlie,charlie@test.com',
    }));
    await s3Client.send(new PutObjectCommand({
      Bucket: testBucket, Key: 'data/orders.json',
      Body: JSON.stringify([
        { id: 1, product: 'Widget', amount: 100 },
        { id: 2, product: 'Gizmo', amount: 200 },
      ]),
    }));
    await s3Client.send(new PutObjectCommand({
      Bucket: testBucket, Key: 'data/empty.csv',
      Body: '',
    }));

    // Now connect the connector
    const s3Config = {
      ...config,
      bucket: testBucket,
      accessKeyId: config.accessKeyId || 'test',
      secretAccessKey: config.secretAccessKey || 'testtest',
      forcePathStyle: true,
    };
    connector = ConnectorRegistry.getSource('s3', 'test-s3', s3Config);
    await connector.connect(s3Config);
  });

  afterAll(async () => {
    if (s3Client) {
      try {
        const { DeleteObjectCommand, DeleteBucketCommand } = await import('@aws-sdk/client-s3');
        await s3Client.send(new DeleteObjectCommand({ Bucket: testBucket, Key: 'data/users.csv' }));
        await s3Client.send(new DeleteObjectCommand({ Bucket: testBucket, Key: 'data/orders.json' }));
        await s3Client.send(new DeleteObjectCommand({ Bucket: testBucket, Key: 'data/empty.csv' }));
        await s3Client.send(new DeleteBucketCommand({ Bucket: testBucket }));
      } catch { /* best effort */ }
    }
    if (connector?.isConnected()) {
      await connector.disconnect();
    }
  });

  it('should connect successfully', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('should list objects as tables', async () => {
    const tables = await connector.getTables();
    expect(Array.isArray(tables)).toBe(true);
  });

  it('should extractFull from CSV file', async () => {
    const events: UnifiedChangeEvent[] = await connector.extractFull('data/users.csv');
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].op).toBe('S');
    expect(events[0].table).toBe('data/users.csv');
  });

  it('should extractFull from JSON file', async () => {
    const events: UnifiedChangeEvent[] = await connector.extractFull('data/orders.json');
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].after).toBeDefined();
  });

  it('should handle empty file', async () => {
    const events = await connector.extractFull('data/empty.csv');
    expect(Array.isArray(events)).toBe(true);
  });

  it('should extractIncremental with watermark', async () => {
    const events = await connector.extractIncremental('data/users.csv');
    expect(Array.isArray(events)).toBe(true);
  });
});
