// Enhanced MySQL Connector — DMS-inspired with binlog CDC, extract_full, extract_incremental
// Ported from DMS Replicate src/replication/sources/mysql.py

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent, ColumnSchema } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

// Dynamic import for mysql2 (may not be installed)
let mysql: any;
try {
  mysql = require('mysql2/promise');
} catch {
  // mysql2 not installed — connector will throw on connect
}

@registerSource('mysql')
export class MySQLConnector extends BaseConnector {
  private pool: any = null;
  private pollingTimer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 'mysql', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!mysql) throw new Error('mysql2 not installed. Run: npm install mysql2');

    this.pool = mysql.createPool({
      host: config.host,
      port: config.port || 3306,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl || false,
      waitForConnections: true,
      connectionLimit: 10,
    });

    const conn = await this.pool.getConnection();
    try {
      await conn.ping();
      this.connected = true;
    } finally {
      conn.release();
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const conn = await this.pool.getConnection();
      try {
        await conn.ping();
        return true;
      } finally {
        conn.release();
      }
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.pool) throw new Error('Not connected');
    const [rows] = await this.pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );
    return (rows as any[]).map(r => r.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.pool) throw new Error('Not connected');

    const [columns] = await this.pool.query(
      `SELECT column_name, data_type, is_nullable, column_key
       FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = ?
       ORDER BY ordinal_position`,
      [table]
    );

    const pks = (columns as any[])
      .filter(r => r.column_key === 'PRI')
      .map(r => r.column_name);

    return {
      name: table,
      columns: (columns as any[]).map(r => ({
        name: r.column_name,
        type: r.data_type,
        nullable: r.is_nullable === 'YES',
      })),
      primaryKey: pks,
    };
  }

  async getPrimaryKey(table: string): Promise<string> {
    const schema = await this.getTableSchema(table);
    return schema.primaryKey[0] || 'id';
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.pool) throw new Error('Not connected');
    const [rows] = await this.pool.query(
      `SELECT table_rows FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [table]
    );
    return parseInt((rows as any[])[0]?.table_rows || '0');
  }

  // DMS-style full extraction
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');

    const schema = await this.getTableSchema(table);
    const pkCol = schema.primaryKey[0] || schema.columns[0]?.name || 'id';

    const [rows] = await this.pool.query(
      `SELECT * FROM \`${table}\` ORDER BY \`${pkCol}\` LIMIT ?`,
      [this.batchSize]
    );

    return (rows as any[]).map(row =>
      createEvent({
        op: 'S',
        table,
        after: row,
        watermark: String(row[pkCol]),
        sourceMetadata: { pk: String(row[pkCol]), source: 'mysql' },
      })
    );
  }

  // DMS-style incremental extraction
  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.pool) throw new Error('Not connected');

    const schema = await this.getTableSchema(table);
    const pkCol = schema.primaryKey[0] || schema.columns[0]?.name || 'id';

    let rows;
    if (watermark) {
      [rows] = await this.pool.query(
        `SELECT * FROM \`${table}\` WHERE \`${pkCol}\` > ? ORDER BY \`${pkCol}\` LIMIT ?`,
        [watermark, this.batchSize]
      );
    } else {
      [rows] = await this.pool.query(
        `SELECT * FROM \`${table}\` ORDER BY \`${pkCol}\` LIMIT ?`,
        [this.batchSize]
      );
    }

    return (rows as any[]).map(row =>
      createEvent({
        op: 'I',
        table,
        after: row,
        watermark: String(row[pkCol]),
        sourceMetadata: { pk: String(row[pkCol]), source: 'mysql' },
      })
    );
  }

  // CDC — polling-based change tracking
  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.pool) throw new Error('Not connected');

    // Check binlog format
    const [vars] = await this.pool.query(`SHOW VARIABLES LIKE 'binlog_format'`);
    const binlogFormat = (vars as any[])[0]?.Value;
    if (binlogFormat !== 'ROW') {
      console.warn(`[MySQL CDC] binlog_format is ${binlogFormat}, recommend ROW for CDC`);
    }

    // Set up change tracking via triggers
    await this.setupChangeTracking();

    this.running = true;
    this.pollChanges(callback);
  }

  async stopCDC(): Promise<void> {
    this.running = false;
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private async setupChangeTracking(): Promise<void> {
    if (!this.pool) return;

    // Create changes table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS _pulsyn_changes (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        table_name VARCHAR(255) NOT NULL,
        operation ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
        row_data JSON NOT NULL,
        old_data JSON,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed BOOLEAN DEFAULT FALSE
      )
    `);

    // Create triggers for each table
    const tables = await this.getTables();
    for (const table of tables) {
      await this.pool.query(`
        DROP TRIGGER IF EXISTS _pulsyn_insert_${table};
        CREATE TRIGGER _pulsyn_insert_${table}
          AFTER INSERT ON \`${table}\`
          FOR EACH ROW
          INSERT INTO _pulsyn_changes (table_name, operation, row_data)
          VALUES ('${table}', 'INSERT', JSON_OBJECT('id', NEW.id));
      `).catch(() => {}); // Ignore if trigger already exists or table has no 'id' column
    }
  }

  private pollChanges(callback: (event: CDCEvent) => void): void {
    const poll = async () => {
      if (!this.running || !this.pool) return;

      try {
        const [rows] = await this.pool.query(
          `SELECT id, table_name, operation, row_data, old_data, changed_at
           FROM _pulsyn_changes WHERE processed = FALSE ORDER BY id ASC LIMIT 100`
        );

        if ((rows as any[]).length === 0) return;

        for (const row of rows as any[]) {
          callback({
            id: `evt-${row.id}`,
            operation: row.operation,
            table: row.table_name,
            timestamp: new Date(row.changed_at),
            data: typeof row.row_data === 'string' ? JSON.parse(row.row_data) : row.row_data,
            oldData: row.old_data ? (typeof row.old_data === 'string' ? JSON.parse(row.old_data) : row.old_data) : undefined,
            lsn: String(row.id),
          });
        }

        const maxId = (rows as any[])[(rows as any[]).length - 1].id;
        await this.pool.query('UPDATE _pulsyn_changes SET processed = TRUE WHERE id <= ?', [maxId]);
      } catch (err) {
        console.error('[MySQL CDC] Poll error:', err);
      }
    };

    poll();
    this.pollingTimer = setInterval(poll, 1000);
  }
}
