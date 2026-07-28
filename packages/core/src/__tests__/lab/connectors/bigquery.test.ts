// BigQuery Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bigquery';

const config: ConnectorTestConfig = {
  connectorId: 'test-bigquery',
  connectorType: 'source',
  engine: 'bigquery',
  config: {
    host: process.env.TEST_BIGQUERY_HOST || 'localhost',
    port: 443,
    database: process.env.TEST_BIGQUERY_DB || 'testdb',
    username: '',
    password: '',
    projectId: process.env.TEST_BIGQUERY_PROJECT || '',
    keyFilename: process.env.TEST_BIGQUERY_KEY_FILE || '',
    credentials: process.env.TEST_BIGQUERY_CREDENTIALS ? JSON.parse(process.env.TEST_BIGQUERY_CREDENTIALS) : undefined,
    location: 'US',
    ssl: true,
  } as any,
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
