// CoinDesk BPI — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/coindesk-bpi';

const config: ConnectorTestConfig = {
  connectorId: 'test-coindesk-bpi',
  connectorType: 'source',
  engine: 'coindesk-bpi',
  config: { host: 'https://api.coindesk.com/v1' },
  testTables: ['bpi'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
