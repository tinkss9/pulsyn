// ClickHouse Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/clickhouse';

const config: ConnectorTestConfig = {
  connectorId: 'test-clickhouse',
  connectorType: 'source',
  engine: 'clickhouse',
  config: {
    host: process.env.TEST_CLICKHOUSE_HOST || 'localhost',
    port: parseInt(process.env.TEST_CLICKHOUSE_PORT || '8123'),
    database: process.env.TEST_CLICKHOUSE_DB || 'testdb',
    username: process.env.TEST_CLICKHOUSE_USER || 'test',
    password: process.env.TEST_CLICKHOUSE_PASS || 'test',
    user: process.env.TEST_CLICKHOUSE_USER || 'test',
  },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
