#!/usr/bin/env tsx
// Auto-generate connector test files for all registered connectors
// Usage: npx tsx scripts/generate-connector-tests.ts [--dry-run]

import * as fs from 'fs';
import * as path from 'path';

const CONNECTORS_DIR = path.join(__dirname, '../src/connectors');
const TESTS_DIR = path.join(__dirname, '../src/__tests__/lab/connectors');
const DRY_RUN = process.argv.includes('--dry-run');

// Community APIs that need no auth — will be auto-detected
const KNOWN_COMMUNITY = [
  'jsonplaceholder', 'pokeapi', 'openlibrary', 'thecatapi',
  'randomuser', 'exchangerate', 'catfacts', 'openmeteo',
  'kanyerest', 'jokeapi', 'dogceo', 'countriesv3',
  'coingecko', 'frankfurter', 'deckofcards', 'chucknorris', 'httpstatusdogs',
  'randomfox', 'httpcat', 'metmuseum', 'artic',
  'jikan', 'ghibli', 'wizardworld', 'nagerdate', 'memegen', 'dummyimage',
  'poetrydb', 'openholidays', 'emojihub', 'coinpaprika',
  'numbersapi', 'httpbin',
];

// Connectors that need Docker services
const DOCKER_SERVICES: Record<string, { config: string; tables: string[] }> = {
  postgresql: { config: `{ host: 'localhost', port: 5432, database: 'testdb', user: 'test', password: 'test' }`, tables: ['users'] },
  mysql: { config: `{ host: 'localhost', port: 3306, database: 'testdb', user: 'root', password: 'test' }`, tables: ['users'] },
  mssql: { config: `{ host: 'localhost', port: 1433, database: 'master', user: 'sa', password: 'Test@12345' }`, tables: ['dbo.users'] },
  mongodb: { config: `{ host: 'localhost', port: 27017, database: 'testdb', user: 'test', password: 'test', authSource: 'admin' }`, tables: ['users'] },
  redis: { config: `{ host: 'localhost', port: 6379 }`, tables: [] },
  clickhouse: { config: `{ host: 'localhost', port: 8123, database: 'testdb' }`, tables: ['users'] },
  cassandra: { config: `{ host: 'localhost', port: 9042, keyspace: 'testdb' }`, tables: ['users'] },
  dynamodb: { config: `{ host: 'localhost', port: 8000, region: 'us-east-1', accessKeyId: 'test', secretAccessKey: 'test' }`, tables: ['users'] },
  elasticsearch: { config: `{ host: 'localhost', port: 9200 }`, tables: ['indices'] },
  kafka: { config: `{ host: 'localhost', port: 9092, brokers: ['localhost:9092'] }`, tables: ['test-topic'] },
  s3: { config: `{ host: 'localhost', port: 4566, region: 'us-east-1', accessKeyId: 'test', secretAccessKey: 'testtest', endpoint: 'http://localhost:4566' }`, tables: ['pulsyn-test/data/users.csv'] },
  r2: { config: `{ host: 'localhost', port: 4566, region: 'auto', accessKeyId: 'test', secretAccessKey: 'testtest', endpoint: 'http://localhost:4566' }`, tables: ['data/users.csv'] },
  github: { config: `{ host: 'api.github.com', token: process.env.GITHUB_TOKEN || '' }`, tables: [] },
};

interface ConnectorInfo {
  name: string;
  type: 'source' | 'target';
  isSaaS: boolean;
  filePath: string;
}

function extractConnectorInfo(filePath: string): ConnectorInfo | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract registerSource or registerTarget
  const sourceMatch = content.match(/@registerSource\(['"]([^'"]+)['"]\)/);
  const targetMatch = content.match(/@registerTarget\(['"]([^'"]+)['"]\)/);
  
  if (!sourceMatch && !targetMatch) return null;
  
  const name = (sourceMatch || targetMatch)![1];
  const type = sourceMatch ? 'source' : 'target';
  const isSaaS = content.includes('extends SaaSConnector');
  
  return { name, type, isSaaS, filePath };
}

function generateTestFile(info: ConnectorInfo): string {
  const { name, type, isSaaS } = info;
  
  // Determine config
  let config = '{}';
  let testTables: string[] = [];
  let skipCDC = true;
  let skipBenchmark = false;
  
  if (DOCKER_SERVICES[name]) {
    config = DOCKER_SERVICES[name].config;
    testTables = DOCKER_SERVICES[name].tables;
    skipBenchmark = false;
  } else if (KNOWN_COMMUNITY.includes(name) || !isSaaS) {
    // Community API or simple BaseConnector
    config = '{}';
    testTables = [];
    skipBenchmark = false;
  } else {
    // SaaS connector — needs API key
    config = `{ /* TODO: Add API credentials */ }`;
    testTables = [];
    skipBenchmark = true;
  }
  
  const testTablesStr = testTables.length > 0 
    ? `['${testTables.join("', '")}']`
    : '[]';

  return `// ${name} Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/${path.basename(info.filePath, '.ts')}';

const config: ConnectorTestConfig = {
  connectorId: 'test-${name}',
  connectorType: '${type}',
  engine: '${name}',
  config: ${config},
  testTables: ${testTablesStr},
  skipCDC: ${skipCDC},
  skipBenchmark: ${skipBenchmark},
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
`;
}

// Main
const connectorFiles = fs.readdirSync(CONNECTORS_DIR)
  .filter(f => f.endsWith('.ts') && !['index.ts', 'registry.ts', 'base.ts', 'saas-base.ts'].includes(f));

const connectors: ConnectorInfo[] = [];
for (const file of connectorFiles) {
  const info = extractConnectorInfo(path.join(CONNECTORS_DIR, file));
  if (info) connectors.push(info);
}

console.log(`Found ${connectors.length} registered connectors`);

// Check which already have tests
const existingTests = fs.readdirSync(TESTS_DIR)
  .filter(f => f.endsWith('.test.ts'))
  .map(f => f.replace('.test.ts', ''));

const missing = connectors.filter(c => !existingTests.includes(c.name));
console.log(`Already tested: ${existingTests.length}`);
console.log(`Missing tests: ${missing.length}`);

if (DRY_RUN) {
  console.log('\nWould generate tests for:');
  for (const c of missing) {
    const category = DOCKER_SERVICES[c.name] ? '🐳 Docker' : 
                     KNOWN_COMMUNITY.includes(c.name) ? '🌐 Community' : 
                     c.isSaaS ? '🔑 SaaS' : '📦 Base';
    console.log(`  ${category} ${c.name} (${c.type})`);
  }
} else {
  let generated = 0;
  for (const c of missing) {
    const testFile = path.join(TESTS_DIR, `${c.name}.test.ts`);
    const content = generateTestFile(c);
    fs.writeFileSync(testFile, content, 'utf-8');
    generated++;
  }
  console.log(`\nGenerated ${generated} test files in ${TESTS_DIR}`);
  
  // Update COMMUNITY_ENGINES in runner
  const communityNames = missing
    .filter(c => !DOCKER_SERVICES[c.name] && (!c.isSaaS || KNOWN_COMMUNITY.includes(c.name)))
    .map(c => `'${c.name}'`);
  
  if (communityNames.length > 0) {
    console.log(`\nAdd to COMMUNITY_ENGINES in connector.runner.ts:`);
    console.log(`  ${communityNames.join(', ')}`);
  }
}
