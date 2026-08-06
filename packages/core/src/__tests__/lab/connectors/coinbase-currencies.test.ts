// Coinbase Currencies — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/coinbase-currencies';

const config: ConnectorTestConfig = {
  connectorId: 'test-coinbase-currencies',
  connectorType: 'source',
  engine: 'coinbase-currencies',
  config: { host: 'https://api.coinbase.com/v2' },
  testTables: ['currencies'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
