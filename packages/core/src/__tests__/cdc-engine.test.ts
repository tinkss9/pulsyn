import { describe, it, expect, beforeEach } from 'vitest';
import { CDCEngine } from '../engine/cdc-engine';

describe('CDCEngine', () => {
  let engine: CDCEngine;

  beforeEach(() => {
    engine = new CDCEngine({
      batchSize: 100,
      flushIntervalMs: 500,
      maxRetries: 2,
      checkpointIntervalMs: 1000,
      enableExactlyOnce: true,
    });
  });

  it('should create engine with default config', () => {
    const defaultEngine = new CDCEngine();
    const stats = defaultEngine.getStats();
    expect(stats.running).toBe(false);
    expect(stats.batchSize).toBe(0);
  });

  it('should create engine with custom config', () => {
    const stats = engine.getStats();
    expect(stats.config.batchSize).toBe(100);
    expect(stats.config.flushIntervalMs).toBe(500);
    expect(stats.config.maxRetries).toBe(2);
    expect(stats.config.enableExactlyOnce).toBe(true);
  });

  it('should emit started event', async () => {
    let started = false;
    engine.on('started', () => {
      started = true;
    });

    // Mock source and target
    const mockSource = {
      connect: async () => {},
      disconnect: async () => {},
      testConnection: async () => true,
      getTables: async () => [],
      getTableSchema: async () => ({ name: '', columns: [], primaryKey: [] }),
      startCDC: async () => {},
      stopCDC: async () => {},
    };

    const mockTarget = {
      connect: async () => {},
      disconnect: async () => {},
      testConnection: async () => true,
      getTables: async () => [],
      getTableSchema: async () => ({ name: '', columns: [], primaryKey: [] }),
      startCDC: async () => {},
      stopCDC: async () => {},
    };

    engine.setSource(mockSource as any);
    engine.setTarget(mockTarget as any);

    await engine.start();
    expect(started).toBe(true);

    await engine.stop();
  });

  it('should throw error if source not set', async () => {
    await expect(engine.start()).rejects.toThrow('Source and target connectors must be set');
  });

  it('should throw error if target not set', async () => {
    const mockSource = {
      connect: async () => {},
      disconnect: async () => {},
    };
    engine.setSource(mockSource as any);

    await expect(engine.start()).rejects.toThrow('Source and target connectors must be set');
  });
});
