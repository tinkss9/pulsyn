// Basecamp API v4 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/basecamp-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-basecamp-real',
  connectorType: 'source',
  engine: 'basecamp-real',
  config: { host: 'https://3.basecampapi.com/{account}' },
  testTables: ['projects', 'todos', 'messages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
