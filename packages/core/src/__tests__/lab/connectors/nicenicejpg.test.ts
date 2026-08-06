// NiceNiceJPG — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nicenicejpg';

const config: ConnectorTestConfig = {
  connectorId: 'test-nicenicejpg',
  connectorType: 'source',
  engine: 'nicenicejpg',
  config: {
    host: 'https://nice-nice-jpg.com',
  },
  testTables: ['images'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
