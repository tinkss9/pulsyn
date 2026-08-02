// Exchange Rates API Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/exchangerate';

const config: ConnectorTestConfig = {
  connectorId: 'test-exchangerate',
  connectorType: 'source',
  engine: 'exchangerate',
  config: {
    host: 'https://open.er-api.com/v6',
  },
  testTables: ['rates'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
