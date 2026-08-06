// Coinbase Rates — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/coinbase-rates';

const config: ConnectorTestConfig = {
  connectorId: 'test-coinbase-rates',
  connectorType: 'source',
  engine: 'coinbase-rates',
  config: {
    host: 'https://api.coinbase.com/v2',
  },
  testTables: ['currencies', 'exchange_rates'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
