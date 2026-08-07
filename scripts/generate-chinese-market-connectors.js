#!/usr/bin/env node
/**
 * Chinese Market Database Connectors
 * Tencent Cloud DB, Huawei GaussDB, Alibaba PolarDB
 */

const fs = require('fs');
const path = require('path');

const CONNECTORS_DIR = path.join(__dirname, '../packages/core/src/connectors');
const TESTS_DIR = path.join(__dirname, '../packages/core/src/__tests__/lab/connectors');

const connectors = [
  // Tencent Cloud DB
  {
    id: 'tencentdb',
    name: 'Tencent Cloud DB',
    baseUrl: 'https://cdb.tencentcloudapi.com',
    auth: 'Tencent Cloud API Key (SecretId + SecretKey)',
    description: 'Tencent Cloud MySQL/PostgreSQL/SQL Server — largest Chinese cloud DB provider',
    tables: [
      { name: 'instances', endpoint: '/?Action=DescribeDBInstances', fields: [{n:'InstanceId',t:'string',pk:true},{n:'InstanceName',t:'string'},{n:'Status',t:'string'},{n:'Engine',t:'string'},{n:'EngineVersion',t:'string'}] },
      { name: 'databases', endpoint: '/?Action=DescribeDatabases', fields: [{n:'DatabaseName',t:'string',pk:true},{n:'CharacterSet',t:'string'}] },
    ],
  },
  // Huawei GaussDB
  {
    id: 'gaussdb',
    name: 'Huawei GaussDB',
    baseUrl: 'https://gaussdb.cn-north-4.myhuaweicloud.com/v3',
    auth: 'Huawei Cloud AK/SK (Access Key + Secret Key)',
    description: 'Huawei GaussDB — distributed relational DB, 2nd largest Chinese cloud',
    tables: [
      { name: 'instances', endpoint: '/{project_id}/instances', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'status',t:'string'},{n:'engine',t:'string'},{n:'version',t:'string'}] },
      { name: 'backups', endpoint: '/{project_id}/backups', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'status',t:'string'},{n:'size',t:'number'}] },
    ],
  },
  // Alibaba PolarDB
  {
    id: 'polardb',
    name: 'Alibaba PolarDB',
    baseUrl: 'https://polardb.aliyuncs.com',
    auth: 'Alibaba Cloud AccessKey (AccessKeyId + AccessKeySecret)',
    description: 'Alibaba PolarDB — cloud-native distributed DB, MySQL/PostgreSQL compatible',
    tables: [
      { name: 'clusters', endpoint: '/?Action=DescribeDBClusters', fields: [{n:'DBClusterId',t:'string',pk:true},{n:'DBClusterDescription',t:'string'},{n:'Status',t:'string'},{n:'Engine',t:'string'},{n:'EngineVersion',t:'string'}] },
      { name: 'databases', endpoint: '/?Action=DescribeDatabases', fields: [{n:'DBName',t:'string',pk:true},{n:'CharacterSetName',t:'string'},{n:'DBStatus',t:'string'}] },
    ],
  },
  // Alibaba AnalyticDB
  {
    id: 'analyticdb',
    name: 'Alibaba AnalyticDB',
    baseUrl: 'https://adb.aliyuncs.com',
    auth: 'Alibaba Cloud AccessKey',
    description: 'Alibaba AnalyticDB — real-time OLAP, data warehouse',
    tables: [
      { name: 'clusters', endpoint: '/?Action=DescribeDBClusters', fields: [{n:'DBClusterId',t:'string',pk:true},{n:'DBClusterDescription',t:'string'},{n:'Status',t:'string'}] },
    ],
  },
  // Tencent TDSQL
  {
    id: 'tdsql',
    name: 'Tencent TDSQL',
    baseUrl: 'https://tdsql.tencentcloudapi.com',
    auth: 'Tencent Cloud API Key',
    description: 'Tencent TDSQL — distributed database, financial grade',
    tables: [
      { name: 'instances', endpoint: '/?Action=DescribeDBInstances', fields: [{n:'InstanceId',t:'string',pk:true},{n:'InstanceName',t:'string'},{n:'Status',t:'string'},{n:'Engine',t:'string'}] },
    ],
  },
  // Huawei Cloud RDS
  {
    id: 'huawei-rds',
    name: 'Huawei Cloud RDS',
    baseUrl: 'https://rds.cn-north-4.myhuaweicloud.com/v3',
    auth: 'Huawei Cloud AK/SK',
    description: 'Huawei Cloud RDS — MySQL/PostgreSQL/SQL Server managed service',
    tables: [
      { name: 'instances', endpoint: '/{project_id}/instances', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'status',t:'string'},{n:'engine',t:'string'},{n:'version',t:'string'}] },
    ],
  },
  // Alibaba Cloud RDS
  {
    id: 'aliyun-rds',
    name: 'Alibaba Cloud RDS',
    baseUrl: 'https://rds.aliyuncs.com',
    auth: 'Alibaba Cloud AccessKey',
    description: 'Alibaba Cloud RDS — MySQL/PostgreSQL/SQL Server managed service',
    tables: [
      { name: 'instances', endpoint: '/?Action=DescribeDBInstances', fields: [{n:'DBInstanceId',t:'string',pk:true},{n:'DBInstanceDescription',t:'string'},{n:'DBInstanceStatus',t:'string'},{n:'Engine',t:'string'},{n:'EngineVersion',t:'string'}] },
    ],
  },
  // Tencent Cloud CynosDB (TDSQL-C)
  {
    id: 'cynosdb',
    name: 'Tencent CynosDB',
    baseUrl: 'https://cynosdb.tencentcloudapi.com',
    auth: 'Tencent Cloud API Key',
    description: 'Tencent CynosDB (TDSQL-C) — cloud-native MySQL/PostgreSQL compatible',
    tables: [
      { name: 'clusters', endpoint: '/?Action=DescribeClusters', fields: [{n:'ClusterId',t:'string',pk:true},{n:'ClusterName',t:'string'},{n:'Status',t:'string'},{n:'Engine',t:'string'}] },
    ],
  },
  // Huawei GaussDB(for MySQL)
  {
    id: 'gaussdb-mysql',
    name: 'Huawei GaussDB MySQL',
    baseUrl: 'https://gaussdb.cn-north-4.myhuaweicloud.com/v3',
    auth: 'Huawei Cloud AK/SK',
    description: 'Huawei GaussDB(for MySQL) — MySQL compatible distributed DB',
    tables: [
      { name: 'instances', endpoint: '/{project_id}/instances', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'status',t:'string'},{n:'engine_version',t:'string'}] },
    ],
  },
  // Alibaba TableStore (OTS)
  {
    id: 'tablestore',
    name: 'Alibaba TableStore',
    baseUrl: 'https://{instance}.cn-hangzhou.ots.aliyuncs.com',
    auth: 'Alibaba Cloud AccessKey',
    description: 'Alibaba TableStore — NoSQL wide-column store, IoT/BigData',
    tables: [
      { name: 'tables', endpoint: '/ListTable', fields: [{n:'table_name',t:'string',pk:true}] },
    ],
  },
];

function pascalCase(str) { return str.replace(/(^|-|_)(\w)/g, (_, _p, c) => c.toUpperCase()); }

function generateConnector(c) {
  const className = pascalCase(c.id) + 'Connector';
  const tablesConst = c.tables.map(t => {
    const cols = t.fields.map(f => `{ name: '${f.n}', type: '${f.t}', nullable: false, primaryKey: ${f.pk || false} }`).join(', ');
    return `{ name: '${t.name}', endpoint: '${t.endpoint}', schema: { name: '${t.name}', table: '${t.name}', columns: [${cols}], primaryKey: ['${t.fields.find(f => f.pk)?.n || t.fields[0].n}'] }, idField: '${t.fields.find(f => f.pk)?.n || t.fields[0].n}' }`;
  }).join(',\n');

  return `// ${c.name} — ${c.description}
// Auth: ${c.auth}
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
${tablesConst}
];

@registerSource('${c.id}')
export class ${className} extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, '${c.id}', '${c.id}', config, {
      baseUrl: config.host || '${c.baseUrl}',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '${c.tables[0].endpoint.split('?')[0]}',
    });
  }
}
`;
}

function generateTest(c) {
  const tables = c.tables.map(t => `'${t.name}'`).join(', ');
  return `// ${c.name} — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/${c.id}';

const config: ConnectorTestConfig = {
  connectorId: 'test-${c.id}',
  connectorType: 'source',
  engine: '${c.id}',
  config: { host: '${c.baseUrl}' },
  testTables: [${tables}],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
`;
}

let created = 0, skipped = 0;
for (const c of connectors) {
  const cp = path.join(CONNECTORS_DIR, `${c.id}.ts`);
  const tp = path.join(TESTS_DIR, `${c.id}.test.ts`);
  if (fs.existsSync(cp)) { skipped++; continue; }
  fs.writeFileSync(cp, generateConnector(c));
  fs.writeFileSync(tp, generateTest(c));
  console.log(`CREATED ${c.id} — ${c.tables.length} tables`);
  created++;
}
console.log(`\nDone: ${created} created, ${skipped} skipped`);
