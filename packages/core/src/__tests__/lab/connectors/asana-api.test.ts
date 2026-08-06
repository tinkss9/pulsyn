// Asana API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/asana-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-asana-api',
  connectorType: 'source',
  engine: 'asana-api',
  config: { host: 'https://app.asana.com/api/1.0' },
  testTables: ['projects', 'tasks'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
