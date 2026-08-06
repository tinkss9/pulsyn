// Finnhub — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/finnhub';

const config: ConnectorTestConfig = {
  connectorId: 'test-finnhub',
  connectorType: 'source',
  engine: 'finnhub',
  config: {
    host: 'https://finnhub.io/api/v1',
  },
  testTables: ['stock'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
