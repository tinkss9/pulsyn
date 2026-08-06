// Alpha Vantage — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/alpha-vantage';

const config: ConnectorTestConfig = {
  connectorId: 'test-alpha-vantage',
  connectorType: 'source',
  engine: 'alpha-vantage',
  config: {
    host: 'https://www.alphavantage.co/query',
  },
  testTables: ['exchange_rate'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
