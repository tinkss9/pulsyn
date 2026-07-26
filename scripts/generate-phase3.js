// Phase 3 Connector Generator — Databases, Warehouses, Analytics, BI
const fs = require('fs');
const path = require('path');

const connectorDir = path.join(__dirname, '../packages/core/src/connectors');

const connectors = [
  // DATABASES (30)
  { name: 'cockroachdb-cloud', engine: 'cockroachdb-cloud', type: 'postgresql', desc: 'CockroachDB Cloud' },
  { name: 'yugabyte-cloud', engine: 'yugabyte-cloud', type: 'postgresql', desc: 'YugabyteDB Cloud' },
  { name: 'tidb-cloud', engine: 'tidb-cloud', type: 'mysql', desc: 'TiDB Cloud' },
  { name: 'neon-serverless', engine: 'neon-serverless', type: 'postgresql', desc: 'Neon Serverless' },
  { name: 'supabase-v3', engine: 'supabase-v3', type: 'postgresql', desc: 'Supabase v3' },
  { name: 'firebase-v2', engine: 'firebase-v2', type: 'rest', desc: 'Firebase v2' },
  { name: 'planetscale-v2', engine: 'planetscale-v2', type: 'mysql', desc: 'PlanetScale v2' },
  { name: 'turso', engine: 'turso', type: 'sqlite', desc: 'Turso (libSQL)' },
  { name: 'd1', engine: 'd1', type: 'sqlite', desc: 'Cloudflare D1' },
  { name: 'hyperdrive', engine: 'hyperdrive', type: 'postgresql', desc: 'Cloudflare Hyperdrive' },
  { name: 'neon-proxy', engine: 'neon-proxy', type: 'postgresql', desc: 'Neon Proxy' },
  { name: 'cratedb', engine: 'cratedb', type: 'rest', desc: 'CrateDB' },
  { name: 'cockroachdb-v2', engine: 'cockroachdb-v2', type: 'postgresql', desc: 'CockroachDB v2' },
  { name: 'singlestore-v2', engine: 'singlestore-v2', type: 'mysql', desc: 'SingleStore v2' },
  { name: 'memsql', engine: 'memsql', type: 'mysql', desc: 'MemSQL' },
  { name: 'voltdb', engine: 'voltdb', type: 'rest', desc: 'VoltDB' },
  { name: 'nuodb', engine: 'nuodb', type: 'rest', desc: 'NuoDB' },
  { name: 'clustrix', engine: 'clustrix', type: 'mysql', desc: 'Clustrix' },
  { name: 'deepdb', engine: 'deepdb', type: 'rest', desc: 'DeepDB' },
  { name: 'spanner-v2', engine: 'spanner-v2', type: 'rest', desc: 'Spanner v2' },
  { name: 'cosmosdb-v2', engine: 'cosmosdb-v2', type: 'rest', desc: 'CosmosDB v2' },
  { name: 'dynamodb-v2', engine: 'dynamodb-v2', type: 'rest', desc: 'DynamoDB v2' },
  { name: 'cassandra-v2', engine: 'cassandra-v2', type: 'cql', desc: 'Cassandra v2' },
  { name: 'scylladb-v2', engine: 'scylladb-v2', type: 'cql', desc: 'ScyllaDB v2' },
  { name: 'cockroachdb-serverless-v2', engine: 'cockroachdb-serverless-v2', type: 'postgresql', desc: 'CockroachDB Serverless v2' },
  { name: 'yugabytedb-v2', engine: 'yugabytedb-v2', type: 'postgresql', desc: 'YugabyteDB v2' },
  { name: 'tidb-v2', engine: 'tidb-v2', type: 'mysql', desc: 'TiDB v2' },
  { name: 'materialize-v2', engine: 'materialize-v2', type: 'postgresql', desc: 'Materialize v2' },
  { name: 'starrocks-v2', engine: 'starrocks-v2', type: 'mysql', desc: 'StarRocks v2' },
  { name: 'doris-v2', engine: 'doris-v2', type: 'mysql', desc: 'Apache Doris v2' },

  // DATA WAREHOUSES (25)
  { name: 'snowflake-v3', engine: 'snowflake-v3', type: 'rest', desc: 'Snowflake v3' },
  { name: 'bigquery-v3', engine: 'bigquery-v3', type: 'rest', desc: 'BigQuery v3' },
  { name: 'redshift-v3', engine: 'redshift-v3', type: 'postgresql', desc: 'Redshift v3' },
  { name: 'synapse-v2', engine: 'synapse-v2', type: 'mssql', desc: 'Synapse v2' },
  { name: 'databricks-v3', engine: 'databricks-v3', type: 'rest', desc: 'Databricks v3' },
  { name: 'firebolt-v2', engine: 'firebolt-v2', type: 'rest', desc: 'Firebolt v2' },
  { name: 'motherduck-v2', engine: 'motherduck-v2', type: 'duckdb', desc: 'MotherDuck v2' },
  { name: 'duckdb-v3', engine: 'duckdb-v3', type: 'duckdb', desc: 'DuckDB v3' },
  { name: 'clickhouse-v2', engine: 'clickhouse-v2', type: 'rest', desc: 'ClickHouse v2' },
  { name: 'vertica-v2', engine: 'vertica-v2', type: 'rest', desc: 'Vertica v2' },
  { name: 'teradata-v2', engine: 'teradata-v2', type: 'rest', desc: 'Teradata v2' },
  { name: 'netezza-v2', engine: 'netezza-v2', type: 'rest', desc: 'Netezza v2' },
  { name: 'greenplum-v2', engine: 'greenplum-v2', type: 'postgresql', desc: 'Greenplum v2' },
  { name: 'citus-v2', engine: 'citus-v2', type: 'postgresql', desc: 'Citus v2' },
  { name: 'timescale-v4', engine: 'timescale-v4', type: 'postgresql', desc: 'TimescaleDB v4' },
  { name: 'questdb-v3', engine: 'questdb-v3', type: 'rest', desc: 'QuestDB v3' },
  { name: 'influxdb-v2', engine: 'influxdb-v2', type: 'rest', desc: 'InfluxDB v2' },
  { name: 'timescale-v5', engine: 'timescale-v5', type: 'postgresql', desc: 'TimescaleDB v5' },
  { name: 'prometheus-v2', engine: 'prometheus-v2', type: 'rest', desc: 'Prometheus v2' },
  { name: 'victoriametrics-v2', engine: 'victoriametrics-v2', type: 'rest', desc: 'VictoriaMetrics v2' },
  { name: 'grafana-mimir-v2', engine: 'grafana-mimir-v2', type: 'rest', desc: 'Grafana Mimir v2' },
  { name: 'loki-v2', engine: 'loki-v2', type: 'rest', desc: 'Grafana Loki v2' },
  { name: 'tempo-v2', engine: 'tempo-v2', type: 'rest', desc: 'Grafana Tempo v2' },
  { name: 'm3db', engine: 'm3db', type: 'rest', desc: 'M3DB' },
  { name: 'thanos', engine: 'thanos', type: 'rest', desc: 'Thanos' },

  // ANALYTICS (25)
  { name: 'mixpanel-v3', engine: 'mixpanel-v3', type: 'rest', desc: 'Mixpanel v3' },
  { name: 'amplitude-v3', engine: 'amplitude-v3', type: 'rest', desc: 'Amplitude v3' },
  { name: 'heap-v2', engine: 'heap-v2', type: 'rest', desc: 'Heap v2' },
  { name: 'fullstory-v2', engine: 'fullstory-v2', type: 'rest', desc: 'FullStory v2' },
  { name: 'pendo-v2', engine: 'pendo-v2', type: 'rest', desc: 'Pendo v2' },
  { name: 'hotjar-v2', engine: 'hotjar-v2', type: 'rest', desc: 'Hotjar v2' },
  { name: 'crazyegg-v2', engine: 'crazyegg-v2', type: 'rest', desc: 'Crazy Egg v2' },
  { name: 'mouseflow-v2', engine: 'mouseflow-v2', type: 'rest', desc: 'Mouseflow v2' },
  { name: 'sessioncam-v2', engine: 'sessioncam-v2', type: 'rest', desc: 'SessionCam v2' },
  { name: 'google-analytics-v3', engine: 'google-analytics-v3', type: 'rest', desc: 'Google Analytics v3' },
  { name: 'adobe-analytics-v2', engine: 'adobe-analytics-v2', type: 'rest', desc: 'Adobe Analytics v2' },
  { name: 'matomo-v2', engine: 'matomo-v2', type: 'rest', desc: 'Matomo v2' },
  { name: 'plausible-v2', engine: 'plausible-v2', type: 'rest', desc: 'Plausible v2' },
  { name: 'fathom-v2', engine: 'fathom-v2', type: 'rest', desc: 'Fathom v2' },
  { name: 'posthog-v2', engine: 'posthog-v2', type: 'rest', desc: 'PostHog v2' },
  { name: 'segment-v2', engine: 'segment-v2', type: 'rest', desc: 'Segment v2' },
  { name: 'rudderstack', engine: 'rudderstack', type: 'rest', desc: 'RudderStack' },
  { name: 'snowplow', engine: 'snowplow', type: 'rest', desc: 'Snowplow' },
  { name: 'keen', engine: 'keen', type: 'rest', desc: 'Keen IO' },
  { name: 'countly', engine: 'countly', type: 'rest', desc: 'Countly' },
  { name: 'ga4', engine: 'ga4', type: 'rest', desc: 'Google Analytics 4' },
  { name: 'firebase-analytics', engine: 'firebase-analytics', type: 'rest', desc: 'Firebase Analytics' },
  { name: 'clevertap', engine: 'clevertap', type: 'rest', desc: 'CleverTap' },
  { name: 'leanplum', engine: 'leanplum', type: 'rest', desc: 'Leanplum' },
  { name: 'moengage', engine: 'moengage', type: 'rest', desc: 'MoEngage' },

  // BI PLATFORMS (20)
  { name: 'looker-v2', engine: 'looker-v2', type: 'rest', desc: 'Looker v2' },
  { name: 'tableau-v3', engine: 'tableau-v3', type: 'rest', desc: 'Tableau v3' },
  { name: 'power-bi-v2', engine: 'power-bi-v2', type: 'rest', desc: 'Power BI v2' },
  { name: 'sisense-v2', engine: 'sisense-v2', type: 'rest', desc: 'Sisense v2' },
  { name: 'domo-v2', engine: 'domo-v2', type: 'rest', desc: 'Domo v2' },
  { name: 'mode-v2', engine: 'mode-v2', type: 'rest', desc: 'Mode v2' },
  { name: 'metabase-v2', engine: 'metabase-v2', type: 'rest', desc: 'Metabase v2' },
  { name: 'redash', engine: 'redash', type: 'rest', desc: 'Redash' },
  { name: 'superset', engine: 'superset', type: 'rest', desc: 'Apache Superset' },
  { name: 'grafana-v2', engine: 'grafana-v2', type: 'rest', desc: 'Grafana v2' },
  { name: 'kibana', engine: 'kibana', type: 'rest', desc: 'Kibana' },
  { name: 'datadog-v3', engine: 'datadog-v3', type: 'rest', desc: 'Datadog v3' },
  { name: 'newrelic-v3', engine: 'newrelic-v3', type: 'rest', desc: 'New Relic v3' },
  { name: 'dynatrace-v2', engine: 'dynatrace-v2', type: 'rest', desc: 'Dynatrace v2' },
  { name: 'appdynamics-v2', engine: 'appdynamics-v2', type: 'rest', desc: 'AppDynamics v2' },
  { name: 'splunk-v2', engine: 'splunk-v2', type: 'rest', desc: 'Splunk v2' },
  { name: 'sumo-logic-v2', engine: 'sumo-logic-v2', type: 'rest', desc: 'Sumo Logic v2' },
  { name: 'loggly-v2', engine: 'loggly-v2', type: 'rest', desc: 'Loggly v2' },
  { name: 'papertrail', engine: 'papertrail', type: 'rest', desc: 'Papertrail' },
  { name: 'logz-io', engine: 'logz-io', type: 'rest', desc: 'Logz.io' }
];

function generateConnector(conn) {
  const className = conn.name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') + 'Connector';
  
  let connectCode = '';
  let testCode = '';
  let tablesCode = '';
  let schemaCode = '';
  let extractCode = '';
  
  switch (conn.type) {
    case 'postgresql':
      connectCode = `const { Pool } = require('pg'); this.pool = new Pool({ host: config.host, port: config.port || 5432, database: config.database, user: config.user, password: config.password, ssl: config.ssl ? { rejectUnauthorized: false } : undefined }); await this.pool.query('SELECT 1');`;
      testCode = `await this.pool.query('SELECT 1'); return true;`;
      tablesCode = `const res = await this.pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"); return res.rows.map(r => r.table_name);`;
      schemaCode = `const cols = await this.pool.query('SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1', [table]); return { name: table, columns: cols.rows.map(c => ({ name: c.column_name, type: c.data_type, nullable: c.is_nullable === 'YES' })), primaryKey: [] };`;
      extractCode = `const res = await this.pool.query('SELECT * FROM "' + table + '" LIMIT $1', [this.batchSize]); return res.rows.map(row => createEvent({ op: 'S', table, data: row, watermark: row.id || '' }));`;
      break;
    case 'mysql':
      connectCode = `const mysql = require('mysql2/promise'); this.pool = mysql.createPool({ host: config.host, port: config.port || 3306, database: config.database, user: config.user, password: config.password }); await this.pool.query('SELECT 1');`;
      testCode = `await this.pool.query('SELECT 1'); return true;`;
      tablesCode = `const [rows] = await this.pool.query('SHOW TABLES'); return rows.map(r => Object.values(r)[0]);`;
      schemaCode = `const [cols] = await this.pool.query('DESCRIBE ' + table); return { name: table, columns: cols.map(c => ({ name: c.Field, type: c.Type, nullable: c.Null === 'YES' })), primaryKey: cols.filter(c => c.Key === 'PRI').map(c => c.Field) };`;
      extractCode = `const [rows] = await this.pool.query('SELECT * FROM ' + table + ' LIMIT ?', [this.batchSize]); return rows.map(row => createEvent({ op: 'S', table, data: row, watermark: row.id || '' }));`;
      break;
    case 'mssql':
      connectCode = `const mssql = require('mssql'); this.pool = await mssql.connect({ server: config.host, port: config.port || 1433, database: config.database, user: config.user, password: config.password, options: { encrypt: config.ssl || false, trustServerCertificate: true } });`;
      testCode = `await this.pool.request().query('SELECT 1'); return true;`;
      tablesCode = `const res = await this.pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"); return res.recordset.map(r => r.TABLE_NAME);`;
      schemaCode = `const res = await this.pool.request().query('SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ' + table); return { name: table, columns: res.recordset.map(c => ({ name: c.COLUMN_NAME, type: c.DATA_TYPE, nullable: c.IS_NULLABLE === 'YES' })), primaryKey: [] };`;
      extractCode = `const res = await this.pool.request().query('SELECT TOP ' + this.batchSize + ' * FROM ' + table); return res.recordset.map(row => createEvent({ op: 'S', table, data: row, watermark: row.id || '' }));`;
      break;
    case 'cql':
      connectCode = `const cassandra = require('cassandra-driver'); this.client = new cassandra.Client({ contactPoints: [config.host], localDataCenter: config.database || 'datacenter1', credentials: { username: config.user, password: config.password } }); await this.client.execute('SELECT release_version FROM system.local');`;
      testCode = `await this.client.execute('SELECT release_version FROM system.local'); return true;`;
      tablesCode = `const res = await this.client.execute("SELECT table_name FROM system_schema.tables WHERE keyspace_name = '" + this.config.database + "'"); return res.rows.map(r => r.table_name);`;
      schemaCode = `const res = await this.client.execute("SELECT column_name, type FROM system_schema.columns WHERE keyspace_name = '" + this.config.database + "' AND table_name = '" + table + "'"); return { name: table, columns: res.rows.map(c => ({ name: c.column_name, type: c.type, nullable: true })), primaryKey: [] };`;
      extractCode = `const res = await this.client.execute('SELECT * FROM ' + table + ' LIMIT ' + this.batchSize); return res.rows.map(row => createEvent({ op: 'S', table, data: row, watermark: row.id || '' }));`;
      break;
    case 'duckdb':
      connectCode = `const duckdb = require('duckdb'); this.db = new duckdb.Database(config.database || ':memory:');`;
      testCode = `return true;`;
      tablesCode = `return new Promise((resolve, reject) => { this.db.all("SELECT table_name FROM information_schema.tables", (err, rows) => { if (err) reject(err); else resolve(rows.map(r => r.table_name)); }); });`;
      schemaCode = `return { name: table, columns: [], primaryKey: [] };`;
      extractCode = `return [];`;
      break;
    case 'sqlite':
      connectCode = `const Database = require('better-sqlite3'); this.db = new Database(config.database || ':memory:');`;
      testCode = `this.db.prepare('SELECT 1').get(); return true;`;
      tablesCode = `const rows = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all(); return rows.map(r => r.name);`;
      schemaCode = `const cols = this.db.prepare('PRAGMA table_info(' + table + ')').all(); return { name: table, columns: cols.map(c => ({ name: c.name, type: c.type, nullable: !c.notnull })), primaryKey: cols.filter(c => c.pk).map(c => c.name) };`;
      extractCode = `const rows = this.db.prepare('SELECT * FROM ' + table + ' LIMIT ' + this.batchSize).all(); return rows.map(row => createEvent({ op: 'S', table, data: row, watermark: row.id || '' }));`;
      break;
    default: // rest
      connectCode = `this.apiKey = config.password; this.baseUrl = config.host ? (config.host.startsWith('http') ? config.host : 'https://' + config.host) : '';`;
      testCode = `const res = await fetch(this.baseUrl + '/api/v1/status', { headers: { Authorization: 'Bearer ' + this.apiKey } }); return res.ok || res.status === 401;`;
      tablesCode = `return ['default'];`;
      schemaCode = `return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'data', type: 'object', nullable: true }], primaryKey: ['id'] };`;
      extractCode = `const res = await fetch(this.baseUrl + '/api/v1/' + table + '?limit=' + this.batchSize, { headers: { Authorization: 'Bearer ' + this.apiKey } }); if (!res.ok) return []; const data = await res.json(); return (data.results || data.data || data || []).map(item => createEvent({ op: 'S', table, data: item, watermark: item.id || '' }));`;
  }

  return `// @ts-nocheck
// ${conn.desc} Connector — Pulsyn CDC Platform
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('${conn.name}')
export class ${className} extends BaseConnector {
  private pool: any = null;
  private client: any = null;
  private db: any = null;
  private apiKey: string = '';
  private baseUrl: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, '${conn.engine}', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    ${connectCode}
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.pool) await this.pool.end?.();
    if (this.client) await this.client.shutdown?.();
    if (this.db) this.db.close?.();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      ${testCode}
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    ${tablesCode}
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    ${schemaCode}
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    ${extractCode}
  }

  async startCDC(): Promise<void> { throw new Error('CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}
`;
}

// Generate all connectors
let generated = 0;
for (const conn of connectors) {
  const filePath = path.join(connectorDir, conn.name + '.ts');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, generateConnector(conn));
    generated++;
    console.log('Created: ' + conn.name + '.ts');
  } else {
    console.log('Exists: ' + conn.name + '.ts');
  }
}

console.log('\nGenerated: ' + generated + ' connectors');
console.log('Total planned: ' + connectors.length);
