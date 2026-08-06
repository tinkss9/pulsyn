// CoinDesk — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/coindesk';

const config: ConnectorTestConfig = {
  connectorId: 'test-coindesk',
  connectorType: 'source',
  engine: 'coindesk',
  config: {
    host: 'https://api.coindesk.com/v1',
  },
  testTables: ['bpi'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
