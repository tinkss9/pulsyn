// Kanye Rest — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/kanye-rest';

const config: ConnectorTestConfig = {
  connectorId: 'test-kanye-rest',
  connectorType: 'source',
  engine: 'kanye-rest',
  config: { host: 'https://api.kanye.rest' },
  testTables: ['quotes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
