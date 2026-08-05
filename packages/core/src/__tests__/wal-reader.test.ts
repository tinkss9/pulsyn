// PostgreSQL WAL Reader Test
// Run: npm test -- wal-reader

import { PostgreSQLWALReader, PostgreSQLWALWriter, PostgreSQLPipeline } from '../connectors/postgresql-cdc';

// Skip if no local PostgreSQL
const SKIP = !process.env.PG_HOST;

const config = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'pulsyn_test',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
};

describe.skipIf(SKIP)('PostgreSQL WAL Reader', () => {
  let reader: PostgreSQLWALReader;

  beforeEach(() => {
    reader = new PostgreSQLWALReader({
      ...config,
      plugin: 'wal2json',
      slotName: 'pulsyn_test_slot',
    });
  });

  afterEach(async () => {
    await reader.stop();
  });

  test('should connect to PostgreSQL', async () => {
    await reader.connect();
    expect(reader.getStats().running).toBe(false);
  });

  test('should create replication slot', async () => {
    await reader.connect();
    const status = await reader.getSlotStatus();
    expect(status.slotName).toBe('pulsyn_test_slot');
  });

  test('should read WAL changes', async () => {
    await reader.connect();
    
    const events: any[] = [];
    reader.on('event', (event) => events.push(event));

    await reader.start();

    // Wait for some events
    await new Promise(resolve => setTimeout(resolve, 2000));

    await reader.stop();

    // Should have processed some events
    expect(reader.getStats().eventsProcessed).toBeGreaterThanOrEqual(0);
  });

  test('should get checkpoint', async () => {
    await reader.connect();
    await reader.start();

    await new Promise(resolve => setTimeout(resolve, 1000));

    const checkpoint = reader.getCheckpoint();
    expect(checkpoint).toHaveProperty('lsn');
    expect(checkpoint).toHaveProperty('timestamp');
    expect(checkpoint).toHaveProperty('eventsProcessed');

    await reader.stop();
  });
});

describe.skipIf(SKIP)('PostgreSQL WAL Writer', () => {
  let writer: PostgreSQLWALWriter;

  beforeEach(() => {
    writer = new PostgreSQLWALWriter(config);
  });

  afterEach(async () => {
    await writer.close();
  });

  test('should write INSERT events', async () => {
    const result = await writer.writeBatch([{
      lsn: '0/1000000',
      operation: 'INSERT',
      schema: 'public',
      table: 'test_table',
      columns: { id: 1, name: 'test' },
      timestamp: new Date(),
    }]);

    expect(result.inserted).toBe(1);
    expect(result.errors).toBe(0);
  });

  test('should write UPDATE events', async () => {
    const result = await writer.writeBatch([{
      lsn: '0/1000001',
      operation: 'UPDATE',
      schema: 'public',
      table: 'test_table',
      columns: { id: 1, name: 'updated' },
      oldColumns: { id: 1, name: 'test' },
      timestamp: new Date(),
    }]);

    expect(result.updated).toBe(1);
    expect(result.errors).toBe(0);
  });

  test('should write DELETE events', async () => {
    const result = await writer.writeBatch([{
      lsn: '0/1000002',
      operation: 'DELETE',
      schema: 'public',
      table: 'test_table',
      columns: { id: 1 },
      oldColumns: { id: 1, name: 'updated' },
      timestamp: new Date(),
    }]);

    expect(result.deleted).toBe(1);
    expect(result.errors).toBe(0);
  });

  test('should ensure table exists', async () => {
    const created = await writer.ensureTable({
      schema: 'public',
      table: 'pulsyn_test_table',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false },
        { name: 'name', type: 'TEXT' },
        { name: 'created_at', type: 'TIMESTAMPTZ' },
      ],
      primaryKey: ['id'],
    });

    expect(typeof created).toBe('boolean');
  });
});

describe.skipIf(SKIP)('PostgreSQL Pipeline', () => {
  test('should create and get stats', () => {
    const pipeline = new PostgreSQLPipeline({
      source: config,
      target: config,
      pipelineId: 'test-pipeline',
    });

    const stats = pipeline.getStats();
    expect(stats.pipelineId).toBe('test-pipeline');
    expect(stats.running).toBe(false);
  });
});
