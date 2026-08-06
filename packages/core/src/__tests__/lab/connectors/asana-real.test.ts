// Asana — Comprehensive Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/asana-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-asana-real',
  connectorType: 'source',
  engine: 'asana-real',
  config: { host: 'https://app.asana.com/api/1.0' },
  testTables: ['projects', 'tasks', 'users'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
