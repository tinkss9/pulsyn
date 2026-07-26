// @ts-nocheck
import { parse } from 'csv-parse';
import { createReadStream, readdirSync, statSync } from 'fs';
import { basename, join, extname } from 'path';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface CsvConfig extends DatabaseConfig {
  directory: string;
  delimiter?: string;
  encoding?: BufferEncoding;
  hasHeader?: boolean;
}

@registerSource('csv')
export class CsvConnector extends BaseConnector {
  private directory = '';
  private delimiter = ',';
  private encoding: BufferEncoding = 'utf-8';
  private hasHeader = true;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const cc = config as CsvConfig;
      this.directory = cc.directory || cc.host || '.';
      this.delimiter = cc.delimiter || ',';
      this.encoding = cc.encoding || 'utf-8';
      this.hasHeader = cc.hasHeader !== false;

      // Verify directory is accessible
      const stat = statSync(this.directory);
      if (!stat.isDirectory()) throw new Error(`${this.directory} is not a directory`);
      this.connected = true;
    } catch (error) {
      throw new Error(`CSV connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const stat = statSync(this.directory);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.connected) throw new Error('Not connected');
    try {
      const files = readdirSync(this.directory);
      return files
        .filter((f) => ['.csv', '.tsv', '.txt'].includes(extname(f).toLowerCase()))
        .map((f) => basename(f, extname(f)));
    } catch (error) {
      throw new Error(`Failed to list files: ${(error as Error).message}`);
    }
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.connected) throw new Error('Not connected');
    try {
      const filePath = this.resolveFilePath(table);
      const headers = await this.readHeaders(filePath);
      return {
        table,
        columns: headers.map((name) => ({
          name,
          type: 'string',
          nullable: true,
          defaultValue: undefined,
        })),
        primaryKey: headers.length > 0 ? [headers[0]] : [],
      };
    } catch (error) {
      throw new Error(`Failed to get schema for ${table}: ${(error as Error).message}`);
    }
  }

  async startCDC(_callback: (event: CDCEvent) => void): Promise<void> {
    throw new Error('CDC not supported for CSV connector. Use extractFull for snapshot-only ingestion.');
  }

  async stopCDC(): Promise<void> {
    // No-operation: CDC not supported
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.connected) throw new Error('Not connected');
    const filePath = this.resolveFilePath(table);
    const events: UnifiedChangeEvent[] = [];

    return new Promise((resolve, reject) => {
      let rowIndex = 0;
      const stream = createReadStream(filePath, { encoding: this.encoding });
      const parser = stream.pipe(
        parse({
          delimiter: this.delimiter,
          columns: this.hasHeader,
          skip_empty_lines: true,
          trim: true,
          relax_quotes: true,
        })
      );

      parser.on('data', (record: Record<string, any>) => {
        events.push(createEvent(
          'S', table, record, null,
          rowIndex.toString(),
          { source: 'csv', file: filePath, row: rowIndex }
        ));
        rowIndex++;
      });

      parser.on('end', () => resolve(events));
      parser.on('error', (err) => reject(new Error(`CSV parse error: ${err.message}`)));
    });
  }

  async extractIncremental(name: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.connected) throw new Error('Not connected');
    const filePath = this.resolveFilePath(table);
    const startRow = watermark ? parseInt(watermark, 10) : 0;
    const events: UnifiedChangeEvent[] = [];

    return new Promise((resolve, reject) => {
      let rowIndex = 0;
      const stream = createReadStream(filePath, { encoding: this.encoding });
      const parser = stream.pipe(
        parse({
          delimiter: this.delimiter,
          columns: this.hasHeader,
          skip_empty_lines: true,
          trim: true,
          relax_quotes: true,
        })
      );

      parser.on('data', (record: Record<string, any>) => {
        if (rowIndex >= startRow) {
          events.push(createEvent(
            'I', table, record, null,
            rowIndex.toString(),
            { source: 'csv', file: filePath, row: rowIndex }
          ));
        }
        rowIndex++;
        if (events.length >= this.batchSize) {
          stream.destroy();
          resolve(events);
        }
      });

      parser.on('end', () => resolve(events));
      parser.on('error', (err) => reject(new Error(`CSV parse error: ${err.message}`)));
    });
  }

  private resolveFilePath(table: string): string {
    const candidates = [
      join(this.directory, `${table}.csv`),
      join(this.directory, `${table}.tsv`),
      join(this.directory, `${table}.txt`),
      join(this.directory, table),
    ];
    for (const path of candidates) {
      try {
        if (statSync(path).isFile()) return path;
      } catch { continue; }
    }
    throw new Error(`File not found for table: ${table}`);
  }

  private readHeaders(filePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const stream = createReadStream(filePath, { encoding: this.encoding });
      const parser = stream.pipe(
        parse({ delimiter: this.delimiter, to_line: 1, trim: true })
      );
      let headers: string[] = [];
      parser.on('data', (row: string[]) => { headers = row; });
      parser.on('end', () => { stream.destroy(); resolve(headers); });
      parser.on('error', (err) => reject(err));
    });
  }
}






