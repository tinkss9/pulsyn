// Waifu.im — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/waifuim';

const config: ConnectorTestConfig = {
  connectorId: 'test-waifuim',
  connectorType: 'source',
  engine: 'waifuim',
  config: {
    host: 'https://api.waifu.im',
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
