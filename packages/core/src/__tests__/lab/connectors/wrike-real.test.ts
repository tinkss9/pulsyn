// Wrike API v4 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/wrike-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-wrike-real',
  connectorType: 'source',
  engine: 'wrike-real',
  config: { host: 'https://www.wrike.com/api/v4' },
  testTables: ['tasks', 'projects', 'folders'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
