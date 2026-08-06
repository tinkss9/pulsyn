// Frankfurter Latest — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/frankfurter-latest';

const config: ConnectorTestConfig = {
  connectorId: 'test-frankfurter-latest',
  connectorType: 'source',
  engine: 'frankfurter-latest',
  config: { host: 'https://api.frankfurter.app' },
  testTables: ['latest'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
