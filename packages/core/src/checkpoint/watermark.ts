// Per-table watermark tracker — persists high watermarks to a local JSON file
// Ported from DMS Replicate src/replication/cdc/watermark.py

import * as fs from 'fs';
import * as path from 'path';

export class WatermarkTracker {
  private filePath: string;
  private state: Record<string, string>;

  constructor(config: { stateFile: string }) {
    this.filePath = config.stateFile;
    this.state = this.load();
  }

  private load(): Record<string, string> {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch {
      // Ignore parse errors, start fresh
    }
    return {};
  }

  private save(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  getWatermark(table: string): string | null {
    return this.state[table] ?? null;
  }

  setWatermark(table: string, value: string): void {
    this.state[table] = value;
    this.save();
  }

  getAll(): Record<string, string> {
    return { ...this.state };
  }

  clear(table?: string): void {
    if (table) {
      delete this.state[table];
    } else {
      this.state = {};
    }
    this.save();
  }

  has(table: string): boolean {
    return table in this.state;
  }
}
