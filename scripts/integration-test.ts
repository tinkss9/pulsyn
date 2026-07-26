// Pulsyn Integration Test Suite
// Tests all connectors against real services
// Run: npx tsx scripts/integration-test.ts

import { readdirSync } from 'fs';
import { join } from 'path';

interface TestResult {
  connector: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'ERROR';
  level: 'CONTRACT' | 'INTEGRATION' | 'VENDOR' | 'PRODUCTION';
  duration: number;
  error?: string;
  details?: Record<string, any>;
}

// Test configurations for each service
const TEST_CONFIGS: Record<string, any> = {
  // Databases
  postgresql: { host: 'localhost', port: 5432, database: 'pulsyn_test', user: 'pulsyn', password: 'pulsyn_test_2026' },
  mysql: { host: 'localhost', port: 3306, database: 'pulsyn_test', user: 'pulsyn', password: 'pulsyn_test_2026' },
  mariadb: { host: 'localhost', port: 3307, database: 'pulsyn_test', user: 'root', password: 'pulsyn_test_2026' },
  mongodb: { host: 'localhost', port: 27017, database: 'pulsyn_test', user: 'pulsyn', password: 'pulsyn_test_2026' },
  redis: { host: 'localhost', port: 6379, database: '0', user: '', password: '' },
  cassandra: { host: 'localhost', port: 9042, database: 'pulsyn_test', user: '', password: '' },
  clickhouse: { host: 'localhost', port: 8123, database: 'pulsyn_test', user: 'pulsyn', password: 'pulsyn_test_2026' },
  neo4j: { host: 'localhost', port: 7687, database: 'neo4j', user: 'pulsyn', password: 'pulsyn_test_2026' },
  cockroachdb: { host: 'localhost', port: 26257, database: 'defaultdb', user: 'root', password: '' },
  timescaledb: { host: 'localhost', port: 5433, database: 'pulsyn_test', user: 'pulsyn', password: 'pulsyn_test_2026' },
  duckdb: { host: '', port: 0, database: ':memory:', user: '', password: '' },
  singlestore: { host: 'localhost', port: 3306, database: 'pulsyn_test', user: 'pulsyn', password: 'pulsyn_test_2026' },
  
  // Streaming
  kafka: { host: 'localhost', port: 9092, database: '', user: '', password: '' },
  elasticsearch: { host: 'localhost', port: 9200, database: '', user: '', password: '' },
  influxdb: { host: 'localhost', port: 8086, database: 'pulsyn_test', user: 'pulsyn', password: 'pulsyn_test_token_2026' },
  
  // Cloud (use env vars)
  supabase: { host: process.env.SUPABASE_HOST || 'localhost', port: 5432, database: 'postgres', user: 'postgres', password: process.env.SUPABASE_PASSWORD || '' },
};

async function testConnector(name: string, config: any): Promise<TestResult> {
  const start = Date.now();
  
  try {
    // Dynamic import
    const mod = await import(`../packages/core/src/connectors/${name}`);
    const ConnectorClass = Object.values(mod).find((v: any) => typeof v === 'function' && v.prototype?.connect) as any;
    
    if (!ConnectorClass) {
      return { connector: name, status: 'SKIP', level: 'CONTRACT', duration: 0, error: 'No connector class' };
    }

    const connector = new ConnectorClass(name, name, config);
    
    // Test 1: Connect
    await connector.connect(config);
    
    // Test 2: Test Connection
    const connected = await connector.testConnection();
    if (!connected) throw new Error('testConnection returned false');
    
    // Test 3: Get Tables
    const tables = await connector.getTables();
    if (!Array.isArray(tables)) throw new Error('getTables did not return array');
    
    // Test 4: Get Schema (if tables exist)
    if (tables.length > 0) {
      const schema = await connector.getTableSchema(tables[0]);
      if (!schema.columns) throw new Error('getTableSchema missing columns');
    }
    
    // Test 5: Extract Data (if tables exist)
    if (tables.length > 0) {
      const data = await connector.extractFull(tables[0]);
      if (!Array.isArray(data)) throw new Error('extractFull did not return array');
    }
    
    // Test 6: Disconnect
    await connector.disconnect();
    
    return {
      connector: name,
      status: 'PASS',
      level: 'INTEGRATION',
      duration: Date.now() - start,
      details: { tables: tables.length }
    };
  } catch (err: any) {
    return {
      connector: name,
      status: 'FAIL',
      level: 'CONTRACT',
      duration: Date.now() - start,
      error: err.message?.substring(0, 200)
    };
  }
}

async function main() {
  console.log('=== PULSYN INTEGRATION TEST SUITE ===\n');
  console.log('Prerequisites:');
  console.log('  docker-compose -f docker-compose.test.yml up -d');
  console.log('  Wait 30s for services to start\n');

  const connectorDir = join(__dirname, '../packages/core/src/connectors');
  const files = readdirSync(connectorDir).filter(f => 
    f.endsWith('.ts') && !['base.ts', 'registry.ts', 'events.ts'].includes(f)
  );

  const results: TestResult[] = [];
  
  for (const file of files) {
    const name = file.replace('.ts', '');
    const config = TEST_CONFIGS[name];
    
    if (!config) {
      results.push({ connector: name, status: 'SKIP', level: 'CONTRACT', duration: 0, error: 'No test config' });
      console.log(`⏭️  ${name} — SKIP (no test config)`);
      continue;
    }
    
    process.stdout.write(`Testing ${name}...`);
    const result = await testConnector(name, config);
    results.push(result);
    
    if (result.status === 'PASS') {
      console.log(` ✅ ${result.level} (${result.duration}ms, ${result.details?.tables || 0} tables)`);
    } else {
      console.log(` ❌ ${result.error}`);
    }
  }

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  
  console.log('\n=== RESULTS ===');
  console.log(`✅ INTEGRATION_VALIDATED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`⏭️  SKIPPED: ${skipped}`);
  console.log(`📊 TOTAL: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n=== FAILED CONNECTORS ===');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ❌ ${r.connector}: ${r.error}`);
    });
  }
  
  // Write results to file
  const report = {
    timestamp: new Date().toISOString(),
    summary: { passed, failed, skipped, total: results.length },
    results
  };
  
  const fs = require('fs');
  fs.writeFileSync('integration-test-results.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Results saved to integration-test-results.json');
}

main().catch(console.error);
