// ExchangeRate Free — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/exchangerate-free';

const config: ConnectorTestConfig = {
  connectorId: 'test-exchangerate-free',
  connectorType: 'source',
  engine: 'exchangerate-free',
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
