// ExchangeRate API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/exchangerate-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-exchangerate-api',
  connectorType: 'source',
  engine: 'exchangerate-api',
  config: {
    host: 'https://open.er-api.com/v6',
  },
  testTables: ['rates'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
