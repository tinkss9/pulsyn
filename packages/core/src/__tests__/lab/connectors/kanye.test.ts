// Kanye Rest — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/kanye';

const config: ConnectorTestConfig = {
  connectorId: 'test-kanye',
  connectorType: 'source',
  engine: 'kanye',
  config: {
    host: 'https://api.kanye.rest',
  },
  testTables: ['quotes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
