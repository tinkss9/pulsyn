// Synthetic Data Generator for Connector Testing Lab
// Generates reproducible test data for all connector tests

import { writeFileSync } from 'fs';
import { join } from 'path';

export interface ColumnConfig {
  name: string;
  type: 'string' | 'integer' | 'decimal' | 'boolean' | 'timestamp' | 'uuid' | 'json' | 'binary';
  nullable?: boolean;
  primaryKey?: boolean;
  unique?: boolean;
  min?: number;
  max?: number;
  values?: any[];
  length?: number;
  foreignKey?: { table: string; column: string };
}

export interface TableConfig {
  name: string;
  rowCount: number;
  columns: ColumnConfig[];
  primaryKey: string;
  watermarkColumn?: string;
}

export interface SyntheticDataConfig {
  tables: TableConfig[];
  seed: number;
}

// Seeded random number generator for reproducibility
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 16807 + 0) % 2147483647;
    return this.seed / 2147483647;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextDecimal(min: number, max: number, precision: number = 2): number {
    const value = this.next() * (max - min) + min;
    return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
  }

  nextBoolean(): boolean {
    return this.next() > 0.5;
  }

  nextString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(this.next() * chars.length));
    }
    return result;
  }

  nextEmail(): string {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'test.org'];
    const name = this.nextString(8);
    const domain = domains[Math.floor(this.next() * domains.length)];
    return `${name}@${domain}`;
  }

  nextTimestamp(startYear: number = 2020, endYear: number = 2026): Date {
    const start = new Date(startYear, 0, 1).getTime();
    const end = new Date(endYear, 11, 31).getTime();
    return new Date(start + this.next() * (end - start));
  }

  nextUUID(): string {
    const hex = '0123456789abcdef';
    let uuid = '';
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-';
      } else {
        uuid += hex.charAt(Math.floor(this.next() * 16));
      }
    }
    return uuid;
  }

  nextJSON(): Record<string, any> {
    return {
      tags: [this.nextString(5), this.nextString(5)],
      score: this.nextInt(0, 100),
      active: this.nextBoolean(),
    };
  }

  nextValue<T>(values: T[]): T {
    return values[Math.floor(this.next() * values.length)];
  }

  nextName(): string {
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    return `${this.nextValue(firstNames)} ${this.nextValue(lastNames)}`;
  }

  nextProductName(): string {
    const adjectives = ['Premium', 'Basic', 'Deluxe', 'Classic', 'Modern', 'Vintage', 'Pro', 'Lite'];
    const nouns = ['Widget', 'Gadget', 'Tool', 'Device', 'System', 'Kit', 'Pack', 'Bundle'];
    return `${this.nextValue(adjectives)} ${this.nextValue(nouns)}`;
  }

  nextCategory(): string {
    return this.nextValue(['Electronics', 'Clothing', 'Books', 'Food', 'Home', 'Sports', 'Toys', 'Health']);
  }

  nextOrderStatus(): string {
    return this.nextValue(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
  }
}

// Generate a single row for a table
function generateRow(
  config: TableConfig,
  rowIndex: number,
  rng: SeededRandom,
  foreignKeyValues: Map<string, any[]>
): Record<string, any> {
  const row: Record<string, any> = {};

  for (const col of config.columns) {
    // Handle NULL values
    if (col.nullable && rng.next() < 0.1) {
      row[col.name] = null;
      continue;
    }

    // Handle foreign keys
    if (col.foreignKey) {
      const key = `${col.foreignKey.table}.${col.foreignKey.column}`;
      const values = foreignKeyValues.get(key) || [];
      row[col.name] = values.length > 0 ? rng.nextValue(values) : rowIndex + 1;
      continue;
    }

    // Generate value based on type
    switch (col.type) {
      case 'integer':
        if (col.primaryKey) {
          row[col.name] = rowIndex + 1;
        } else if (col.values) {
          row[col.name] = rng.nextValue(col.values);
        } else {
          row[col.name] = rng.nextInt(col.min || 0, col.max || 1000000);
        }
        break;

      case 'decimal':
        row[col.name] = rng.nextDecimal(col.min || 0, col.max || 10000, 2);
        break;

      case 'boolean':
        row[col.name] = rng.nextBoolean();
        break;

      case 'string':
        if (col.name === 'email') {
          row[col.name] = rng.nextEmail();
        } else if (col.name === 'name' || col.name.includes('name')) {
          row[col.name] = rng.nextName();
        } else if (col.values) {
          row[col.name] = rng.nextValue(col.values);
        } else {
          row[col.name] = rng.nextString(col.length || 10);
        }
        break;

      case 'timestamp':
        if (col.name === config.watermarkColumn) {
          // Watermark column should be monotonically increasing
          row[col.name] = new Date(Date.now() - (config.rowCount - rowIndex) * 1000);
        } else {
          row[col.name] = rng.nextTimestamp();
        }
        break;

      case 'uuid':
        row[col.name] = rng.nextUUID();
        break;

      case 'json':
        row[col.name] = rng.nextJSON();
        break;

      case 'binary':
        row[col.name] = Buffer.from(rng.nextString(20));
        break;

      default:
        row[col.name] = rng.nextString(10);
    }
  }

  return row;
}

// Generate all data for a table
export function generateTableData(config: TableConfig, seed: number): Record<string, any>[] {
  const rng = new SeededRandom(seed);
  const rows: Record<string, any>[] = [];

  for (let i = 0; i < config.rowCount; i++) {
    rows.push(generateRow(config, i, rng, new Map()));
  }

  return rows;
}

// Generate all tables with foreign key relationships
export function generateAllData(config: SyntheticDataConfig): Map<string, Record<string, any>[]> {
  const rng = new SeededRandom(config.seed);
  const data = new Map<string, Record<string, any>[]>();
  const foreignKeyValues = new Map<string, any[]>();

  // Process tables in order (dependencies first)
  for (const table of config.tables) {
    const rows: Record<string, any>[] = [];

    for (let i = 0; i < table.rowCount; i++) {
      const row = generateRow(table, i, rng, foreignKeyValues);
      rows.push(row);

      // Store primary key values for foreign key references
      const pkValue = row[table.primaryKey];
      if (pkValue !== undefined) {
        const key = `${table.name}.${table.primaryKey}`;
        if (!foreignKeyValues.has(key)) {
          foreignKeyValues.set(key, []);
        }
        foreignKeyValues.get(key)!.push(pkValue);
      }
    }

    data.set(table.name, rows);
  }

  return data;
}

// Standard test schema
export const STANDARD_SCHEMA: SyntheticDataConfig = {
  seed: 42,
  tables: [
    {
      name: 'users',
      rowCount: 1000,
      primaryKey: 'id',
      watermarkColumn: 'updated_at',
      columns: [
        { name: 'id', type: 'integer', primaryKey: true },
        { name: 'email', type: 'string', unique: true, length: 20 },
        { name: 'name', type: 'string', length: 50 },
        { name: 'age', type: 'integer', min: 18, max: 100, nullable: true },
        { name: 'balance', type: 'decimal', min: 0, max: 100000 },
        { name: 'is_active', type: 'boolean' },
        { name: 'metadata', type: 'json', nullable: true },
        { name: 'created_at', type: 'timestamp' },
        { name: 'updated_at', type: 'timestamp' },
      ],
    },
    {
      name: 'products',
      rowCount: 500,
      primaryKey: 'id',
      columns: [
        { name: 'id', type: 'integer', primaryKey: true },
        { name: 'name', type: 'string', length: 50 },
        { name: 'price', type: 'decimal', min: 0.01, max: 9999.99 },
        { name: 'category', type: 'string', values: ['Electronics', 'Clothing', 'Books', 'Food', 'Home', 'Sports'] },
        { name: 'inventory', type: 'integer', min: 0, max: 10000 },
        { name: 'created_at', type: 'timestamp' },
      ],
    },
    {
      name: 'orders',
      rowCount: 5000,
      primaryKey: 'id',
      watermarkColumn: 'created_at',
      columns: [
        { name: 'id', type: 'integer', primaryKey: true },
        { name: 'user_id', type: 'integer', foreignKey: { table: 'users', column: 'id' } },
        { name: 'product_id', type: 'integer', foreignKey: { table: 'products', column: 'id' } },
        { name: 'quantity', type: 'integer', min: 1, max: 100 },
        { name: 'total', type: 'decimal', min: 0.01, max: 10000 },
        { name: 'status', type: 'string', values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
        { name: 'created_at', type: 'timestamp' },
      ],
    },
    {
      name: 'events',
      rowCount: 10000,
      primaryKey: 'id',
      watermarkColumn: 'timestamp',
      columns: [
        { name: 'id', type: 'integer', primaryKey: true },
        { name: 'user_id', type: 'integer', foreignKey: { table: 'users', column: 'id' }, nullable: true },
        { name: 'event_type', type: 'string', values: ['page_view', 'click', 'purchase', 'signup', 'logout'] },
        { name: 'properties', type: 'json', nullable: true },
        { name: 'timestamp', type: 'timestamp' },
      ],
    },
  ],
};

// Edge case data
export const EDGE_CASE_DATA = {
  nulls: {
    id: 1,
    email: null,
    name: null,
    age: null,
    balance: null,
    is_active: null,
    metadata: null,
  },
  empty_strings: {
    id: 2,
    email: '',
    name: '',
    age: 0,
    balance: 0,
    is_active: false,
    metadata: {},
  },
  unicode: {
    id: 3,
    email: 'test@example.com',
    name: '中文测试 العربية 🎉',
    age: 25,
    balance: 100.50,
    is_active: true,
    metadata: { language: '中文', emoji: '🎉' },
  },
  special_chars: {
    id: 4,
    email: "test'\"\\@example.com",
    name: "O'Brien \"The Great\" \\slash",
    age: 30,
    balance: 999.99,
    is_active: true,
    metadata: { escaped: "line1\nline2\ttab" },
  },
  large_numbers: {
    id: 5,
    email: 'big@example.com',
    name: 'Big Numbers',
    age: 2147483647,
    balance: 99999999.99,
    is_active: true,
    metadata: { big_int: 2147483647 },
  },
  future_timestamp: {
    id: 6,
    email: 'future@example.com',
    name: 'Future User',
    age: 25,
    balance: 100,
    is_active: true,
    created_at: new Date('2099-12-31T23:59:59Z'),
    updated_at: new Date('2099-12-31T23:59:59Z'),
  },
};

// Generate and save fixtures
export function generateFixtures(outputDir: string): void {
  const data = generateAllData(STANDARD_SCHEMA);

  // Save small fixture (100 rows per table)
  const small = new Map<string, Record<string, any>[]>();
  for (const [table, rows] of data) {
    small.set(table, rows.slice(0, 100));
  }
  writeFileSync(
    join(outputDir, 'small.json'),
    JSON.stringify(Object.fromEntries(small), null, 2)
  );

  // Save medium fixture (1000 rows per table)
  const medium = new Map<string, Record<string, any>[]>();
  for (const [table, rows] of data) {
    medium.set(table, rows.slice(0, 1000));
  }
  writeFileSync(
    join(outputDir, 'medium.json'),
    JSON.stringify(Object.fromEntries(medium), null, 2)
  );

  // Save full fixture
  writeFileSync(
    join(outputDir, 'full.json'),
    JSON.stringify(Object.fromEntries(data), null, 2)
  );

  // Save edge cases
  writeFileSync(
    join(outputDir, 'edge-cases.json'),
    JSON.stringify(EDGE_CASE_DATA, null, 2)
  );

  // Save schema
  writeFileSync(
    join(outputDir, 'schema.json'),
    JSON.stringify(STANDARD_SCHEMA, null, 2)
  );
}

// CLI entry point
if (require.main === module) {
  const outputDir = join(__dirname, 'fixtures');
  generateFixtures(outputDir);
  console.log(`Generated fixtures in ${outputDir}`);
}
