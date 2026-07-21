// Checkpoint Manager
// Manages replication checkpoints for resume capability

import { Checkpoint } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class CheckpointManager {
  private checkpointDir: string;

  constructor(checkpointDir: string = './checkpoints') {
    this.checkpointDir = checkpointDir;
    this.ensureCheckpointDir();
  }

  private ensureCheckpointDir(): void {
    if (!fs.existsSync(this.checkpointDir)) {
      fs.mkdirSync(this.checkpointDir, { recursive: true });
    }
  }

  async saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
    const filePath = this.getCheckpointPath(checkpoint.pipelineId);
    const data = JSON.stringify(checkpoint, null, 2);
    fs.writeFileSync(filePath, data, 'utf-8');
  }

  async loadCheckpoint(pipelineId: string): Promise<Checkpoint | null> {
    const filePath = this.getCheckpointPath(pipelineId);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }

  async deleteCheckpoint(pipelineId: string): Promise<void> {
    const filePath = this.getCheckpointPath(pipelineId);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async listCheckpoints(): Promise<string[]> {
    if (!fs.existsSync(this.checkpointDir)) {
      return [];
    }

    return fs.readdirSync(this.checkpointDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''));
  }

  private getCheckpointPath(pipelineId: string): string {
    return path.join(this.checkpointDir, `${pipelineId}.json`);
  }
}
