// ExchangeRate Latest — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/exchangerate-latest';

const config: ConnectorTestConfig = {
  connectorId: 'test-exchangerate-latest',
  connectorType: 'source',
  engine: 'exchangerate-latest',
  config: { host: 'https://open.er-api.com/v6' },
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
