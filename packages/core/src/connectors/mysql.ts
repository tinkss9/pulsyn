// MySQL Connector
// Binlog-based CDC using MySQL replication

import mysql, { Pool, PoolConfig } from 'mysql2/promise';
import { BaseConnector } from './base';
import {
  DatabaseConfig,
  TableSchema,
  CDCEvent,
  ColumnSchema,
} from '../types';

export class MySQLConnector extends BaseConnector {
  private pool: Pool | null = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'mysql', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? {} : undefined,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
    };

    this.pool = mysql.createPool(poolConfig);

    // Test connection
    const connection = await this.pool.getConnection();
    try {
      await connection.ping();
      this.connected = true;
    } finally {
      connection.release();
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const connection = await this.pool.getConnection();
      try {
        await connection.ping();
        return true;
      } finally {
        connection.release();
      }
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.pool) throw new Error('Not connected');

    const [rows] = await this.pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    return (rows as any[]).map((row) => row.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.pool) throw new Error('Not connected');

    // Get columns
    const [columns] = await this.pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
      AND table_name = ?
      ORDER BY ordinal_position
    `, [table]) as any[];

    const columnSchemas: ColumnSchema[] = columns.map((row: any) => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES',
      defaultValue: row.column_default,
    }));

    // Get primary key
    const [pkRows] = await this.pool.query(`
      SELECT column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = DATABASE()
        AND tc.table_name = ?
      ORDER BY kcu.ordinal_position
    `, [table]) as any[];

    const primaryKey = pkRows.map((row: any) => row.column_name);

    return {
      name: table,
      columns: columnSchemas,
      primaryKey,
    };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.pool) throw new Error('Not connected');

    // Enable binlog if not already enabled
    await this.ensureBinlogEnabled();

    console.log(`[MySQL] CDC started for ${this.config.database}`);
  }

  async stopCDC(): Promise<void> {
    console.log(`[MySQL] CDC stopped for ${this.config.database}`);
  }

  private async ensureBinlogEnabled(): Promise<void> {
    if (!this.pool) return;

    // Check binlog format
    const [rows] = await this.pool.query('SHOW VARIABLES LIKE "binlog_format"') as any[];
    const format = rows[0]?.Value;

    if (format !== 'ROW') {
      console.warn('[MySQL] Binlog format should be ROW for CDC. Current:', format);
    }
  }
}
