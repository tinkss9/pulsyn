// Waifu.pics — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/waifupics';

const config: ConnectorTestConfig = {
  connectorId: 'test-waifupics',
  connectorType: 'source',
  engine: 'waifupics',
  config: {
    host: 'https://api.waifu.pics',
  },
  testTables: ['sfw'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
