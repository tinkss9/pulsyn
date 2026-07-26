// @ts-nocheck
import * as mssql from 'mssql';
import { BaseConnector } from './base';
import { registerTarget } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerTarget('mssql')
export class MSSQLTargetConnector extends BaseConnector {
  private pool: mssql.ConnectionPool | null = null;

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 'mssql', config, options?.batchSize || 5000);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.pool = new mssql.ConnectionPool({
      server: config.host || 'localhost',
      port: config.port || 1433,
      database: config.database || '',
      user: config.username,
      password: config.password,
      options: {
        encrypt: config.ssl ? true : false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
      pool: { max: 20, min: 2, idleTimeoutMillis: 30000 },
    });
    await this.pool.connect();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const r = await this.pool.request().query('SELECT 1 AS ok');
      return r.recordset[0]?.ok === 1;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.pool) throw new Error('Not connected');
    const r = await this.pool.request().query(
      `SELECT SCHEMA_NAME(schema_id)+'.'+name AS full_name FROM sys.tables ORDER BY full_name`
    );
    return r.recordset.map((row) => row.full_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.pool) throw new Error('Not connected');
    const [schema, tableName] = table.includes('.') ? table.split('.') : ['dbo', table];
    const r = await this.pool.request()
      .input('schema', mssql.VarChar, schema)
      .input('table', mssql.VarChar, tableName)
      .query(`SELECT c.COLUMN_NAME, c.DATA_TYPE, c.IS_NULLABLE, c.COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS c WHERE c.TABLE_SCHEMA=@schema AND c.TABLE_NAME=@table ORDER BY c.ORDINAL_POSITION`);
    const pkr = await this.pool.request()
      .input('schema', mssql.VarChar, schema)
      .input('table', mssql.VarChar, tableName)
      .query(`SELECT col.COLUMN_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE col ON tc.CONSTRAINT_NAME=col.CONSTRAINT_NAME
        WHERE tc.TABLE_SCHEMA=@schema AND tc.TABLE_NAME=@table AND tc.CONSTRAINT_TYPE='PRIMARY KEY'`);
    return {
      table,
      columns: r.recordset.map((c) => ({ name: c.COLUMN_NAME, type: c.DATA_TYPE, nullable: c.IS_NULLABLE === 'YES', defaultValue: c.COLUMN_DEFAULT })),
      primaryKeys: pkr.recordset.map((r) => r.COLUMN_NAME),
    };
  }

  async startCDC(_cb: (event: CDCEvent) => void): Promise<void> {
    throw new Error('MSSQL target does not support CDC read');
  }
  async stopCDC(): Promise<void> {}

  async createTableIfNeeded(table: string, schema: Record<string, any>): Promise<void> {
    if (!this.pool) throw new Error('Not connected');
    const [schemaName, tableName] = table.includes('.') ? table.split('.') : ['dbo', table];
    const cols = Object.entries(schema)
      .map(([name, type]) => `[${name}] ${this.mapType(type)}`)
      .join(', ');
    await this.pool.request().query(
      `IF NOT EXISTS (SELECT * FROM sys.tables t JOIN sys.schemas s ON t.schema_id=s.schema_id WHERE s.name='${schemaName}' AND t.name='${tableName}')
       CREATE TABLE [${schemaName}].[${tableName}] (${cols})`
    );
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    if (!this.pool) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    const columns = Object.keys(rows[0]);
    let written = 0;

    for (let i = 0; i < rows.length; i += this.batchSize) {
      const batch = rows.slice(i, i + this.batchSize);

      // Use table-valued insert via batched INSERT statements (1000-row chunks for MSSQL limit)
      const chunkSize = Math.min(1000, this.batchSize);
      for (let j = 0; j < batch.length; j += chunkSize) {
        const chunk = batch.slice(j, j + chunkSize);
        const request = this.pool.request();
        const valueSets: string[] = [];
        let paramIdx = 0;

        for (const row of chunk) {
          const placeholders: string[] = [];
          for (const col of columns) {
            const pName = `p${paramIdx++}`;
            request.input(pName, row[col] ?? null);
            placeholders.push(`@${pName}`);
          }
          valueSets.push(`(${placeholders.join(',')})`);
        }

        const sql = `INSERT INTO ${table} (${columns.map((c) => `[${c}]`).join(',')}) VALUES ${valueSets.join(',')}`;
        await request.query(sql);
        written += chunk.length;
      }
    }
    return written;
  }

  async merge(table: string, events: UnifiedChangeEvent[], keyColumns: string[]): Promise<number> {
    if (!this.pool) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    const columns = Object.keys(rows[0]);
    const nonKeyCols = columns.filter((c) => !keyColumns.includes(c));
    let merged = 0;

    // Process in chunks with temp table approach for large batches
    const tempTable = `#pulsyn_merge_${Date.now()}`;
    const transaction = new mssql.Transaction(this.pool);
    await transaction.begin();

    try {
      const createCols = columns.map((c) => `[${c}] NVARCHAR(MAX)`).join(', ');
      await new mssql.Request(transaction).query(`CREATE TABLE ${tempTable} (${createCols})`);

      // Insert into temp table in chunks
      for (let i = 0; i < rows.length; i += 1000) {
        const chunk = rows.slice(i, i + 1000);
        const req = new mssql.Request(transaction);
        const valueSets: string[] = [];
        let paramIdx = 0;

        for (const row of chunk) {
          const placeholders: string[] = [];
          for (const col of columns) {
            const pName = `p${paramIdx++}`;
            req.input(pName, row[col] != null ? String(row[col]) : null);
            placeholders.push(`@${pName}`);
          }
          valueSets.push(`(${placeholders.join(',')})`);
        }
        await req.query(`INSERT INTO ${tempTable} VALUES ${valueSets.join(',')}`);
      }

      // MERGE from temp into target
      const onClause = keyColumns.map((k) => `tgt.[${k}] = src.[${k}]`).join(' AND ');
      const updateSet = nonKeyCols.map((c) => `tgt.[${c}] = src.[${c}]`).join(', ');
      const insertCols = columns.map((c) => `[${c}]`).join(', ');
      const insertVals = columns.map((c) => `src.[${c}]`).join(', ');

      await new mssql.Request(transaction).query(
        `MERGE INTO ${table} AS tgt USING ${tempTable} AS src ON ${onClause}
         WHEN MATCHED THEN UPDATE SET ${updateSet}
         WHEN NOT MATCHED THEN INSERT (${insertCols}) VALUES (${insertVals});`
      );

      await new mssql.Request(transaction).query(`DROP TABLE ${tempTable}`);
      await transaction.commit();
      merged = rows.length;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    return merged;
  }

  private mapType(type: any): string {
    const t = typeof type === 'string' ? type.toLowerCase() : String(type).toLowerCase();
    if (t.includes('int')) return 'BIGINT';
    if (t.includes('float') || t.includes('double')) return 'FLOAT';
    if (t.includes('decimal') || t.includes('numeric')) return 'DECIMAL(18,4)';
    if (t.includes('bool') || t.includes('bit')) return 'BIT';
    if (t.includes('date') && !t.includes('time')) return 'DATE';
    if (t.includes('time')) return 'DATETIME2';
    if (t.includes('json') || t.includes('text') || t.includes('clob')) return 'NVARCHAR(MAX)';
    return 'NVARCHAR(255)';
  }
}

