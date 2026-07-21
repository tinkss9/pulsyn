import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CheckpointManager } from '../checkpoint/checkpoint-manager';
import * as fs from 'fs';
import * as path from 'path';

describe('CheckpointManager', () => {
  let manager: CheckpointManager;
  const testDir = './test-checkpoints';

  beforeEach(() => {
    manager = new CheckpointManager(testDir);
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  it('should create checkpoint directory', () => {
    expect(fs.existsSync(testDir)).toBe(true);
  });

  it('should save a checkpoint', async () => {
    const checkpoint = {
      id: 'test-1',
      pipelineId: 'pipeline-1',
      lsn: '0/1234567',
      timestamp: new Date(),
      tables: {
        users: {
          tableName: 'users',
          lastLsn: '0/1234567',
          rowsProcessed: 1000,
        },
      },
    };

    await manager.saveCheckpoint(checkpoint);

    const filePath = path.join(testDir, 'pipeline-1.json');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should load a checkpoint', async () => {
    const checkpoint = {
      id: 'test-2',
      pipelineId: 'pipeline-2',
      lsn: '0/2345678',
      timestamp: new Date(),
      tables: {},
    };

    await manager.saveCheckpoint(checkpoint);
    const loaded = await manager.loadCheckpoint('pipeline-2');

    expect(loaded).not.toBeNull();
    expect(loaded?.id).toBe('test-2');
    expect(loaded?.lsn).toBe('0/2345678');
  });

  it('should return null for non-existent checkpoint', async () => {
    const loaded = await manager.loadCheckpoint('non-existent');
    expect(loaded).toBeNull();
  });

  it('should delete a checkpoint', async () => {
    const checkpoint = {
      id: 'test-3',
      pipelineId: 'pipeline-3',
      lsn: '0/3456789',
      timestamp: new Date(),
      tables: {},
    };

    await manager.saveCheckpoint(checkpoint);
    await manager.deleteCheckpoint('pipeline-3');

    const loaded = await manager.loadCheckpoint('pipeline-3');
    expect(loaded).toBeNull();
  });

  it('should list checkpoints', async () => {
    const checkpoint1 = {
      id: 'test-4',
      pipelineId: 'pipeline-4',
      lsn: '0/4567890',
      timestamp: new Date(),
      tables: {},
    };

    const checkpoint2 = {
      id: 'test-5',
      pipelineId: 'pipeline-5',
      lsn: '0/5678901',
      timestamp: new Date(),
      tables: {},
    };

    await manager.saveCheckpoint(checkpoint1);
    await manager.saveCheckpoint(checkpoint2);

    const list = await manager.listCheckpoints();
    expect(list).toHaveLength(2);
    expect(list).toContain('pipeline-4');
    expect(list).toContain('pipeline-5');
  });
});
