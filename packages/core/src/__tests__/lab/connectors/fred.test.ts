// FRED Economic Data — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/fred';

const config: ConnectorTestConfig = {
  connectorId: 'test-fred',
  connectorType: 'source',
  engine: 'fred',
  config: {
    host: 'https://api.stlouisfed.org/fred',
  },
  testTables: ['series'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
