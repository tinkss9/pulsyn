// Coin Flip — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/coin-flip';

const config: ConnectorTestConfig = {
  connectorId: 'test-coin-flip',
  connectorType: 'source',
  engine: 'coin-flip',
  config: {
    host: 'https://coinflip-api.vercel.app',
  },
  testTables: ['flip'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
